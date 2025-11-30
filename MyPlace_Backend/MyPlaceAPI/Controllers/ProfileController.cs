using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using DataLibrary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using MyPlaceAPI.Services;

namespace MyPlaceAPI.Controllers;

// Profile Controller
//  For handling user data
//  i.e. logging in, registering, getting recommendations
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly UserManager<Profile> _userManager;
    private readonly SignInManager<Profile> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ElasticService _elasticService;
    private readonly ProfileContext _profileContext;

    public ProfileController(
        UserManager<Profile> userManager,
        SignInManager<Profile> signInManager,
        IConfiguration configuration,
        ElasticService elasticService,
        ProfileContext profileContext)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _elasticService = elasticService;
        _profileContext = profileContext;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] ProfileDTO profile)
    {
        if (profile.Email is null
            || profile.Password is null
            || profile.FirstName is null
            || profile.LastName is null
            || profile.UserName is null)
        {
            return BadRequest();
        }

        Profile newProfile = new Profile
        {
            Email = profile.Email,
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            UserName = profile.UserName,
        };

        var result = await _userManager.CreateAsync(newProfile, profile.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return Ok();
    }

    [HttpPost("login")]
    public async Task<ActionResult<string>> Login([FromBody] ProfileDTO profile)
    {
        if (profile.Email is null || profile.Password is null)
        {
            return BadRequest();
        }

        Profile? user = await _userManager.FindByEmailAsync(profile.Email);

        if (user is null) return Unauthorized();

        var result = await _signInManager.CheckPasswordSignInAsync(user, profile.Password, false);

        if (!result.Succeeded) return Unauthorized();

        return GenerateJwtToken(user);
    }

    [Authorize]
    [HttpPost("updateprofile")]
    public async Task<ActionResult<ProfileAttributes>> UpdateProfile([FromBody] AttributeDTO attribute)
    {
        var id = User.FindFirstValue(ClaimTypes.Name);
        if (id is null) return Unauthorized();

        var profile = await _userManager.Users
            .Include(profile => profile.Attributes)
            .FirstOrDefaultAsync(identity => identity.Id == id);

        if (profile is null) return Unauthorized();

        profile.Attributes ??= new ProfileAttributes();

        // check each non-null field of DTO
        // https://stackoverflow.com/questions/17385472/entity-framework-only-update-values-that-are-not-null
        var b = BindingFlags.Public | BindingFlags.Instance;
        IEnumerable<Tuple<PropertyInfo, PropertyInfo>> propertyMap =
            (from f in typeof(ProfileAttributes).GetProperties(b)
                join t in typeof(AttributeDTO).GetProperties(b) on f.Name equals t.Name
                select Tuple.Create(f, t))
            .ToArray();

        foreach (var propertyPair in propertyMap)
        {
            var toValue = propertyPair.Item2.GetValue(attribute, null);
            if (toValue != null)
            {
                propertyPair.Item1.SetValue(profile.Attributes, toValue, null);
            }
        }

        profile.Attributes.TraitVector =
        [
            profile.Attributes.Cleanliness, profile.Attributes.Personality, profile.Attributes.HoursAwake
        ];

        var updatePostgres = await _userManager.UpdateAsync(profile);
        if (!updatePostgres.Succeeded) return BadRequest("Postgres Failure");

        // pass this into elastic search too. Everything should be filled in too ;)
        var result = await _elasticService.AddOrUpdate(profile.Attributes);

        return result ? profile.Attributes : BadRequest("Elasticsearch failure");
    }

    private string GenerateJwtToken(Profile profile)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, profile.Id),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Tokens:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: _configuration["Tokens:Issuer"],
            audience: _configuration["Tokens:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(30),
            signingCredentials: credentials);

        var tokenHandler = new JwtSecurityTokenHandler();

        var token = tokenHandler.WriteToken(tokenDescriptor);

        return token;
    }

    // Gets ALL the profiles. Very much only for debugging.
    [HttpGet("getprofile")]
    public async Task<ActionResult<List<Profile>>> GetProfile()
    {
        var profiles = await _userManager.Users
            .Include(profile => profile.Pictures)
            .Include(profile => profile.Attributes)
            .Include(profile => profile.IncomingMatchRequests)
            .Include(profile => profile.OutgoingMatchRequests)
            .ToListAsync();

        return profiles;
    }

    // Retrieves recommendations by calling elasticsearch for similar profiles
    // Then retrieves profile ids from postgres if they are either pending or a suggestion
    // Will NOT tell you which ones are which to avoid stale data.
    [Authorize]
    [HttpGet("get-recommendations")]
    public async Task<ActionResult<List<string>>> GetRecommendations()
    {
        var id = User.FindFirstValue(ClaimTypes.Name);
        if (id is null) return Unauthorized();

        // Get yo profile
        Profile? userProfile = await _userManager.Users
            .Include(profile => profile.Attributes) // need this for the elastic search query
            .Include(profile => profile.OutgoingMatchRequests)
            .Include(profile => profile.IncomingMatchRequests
                .Where(request => request.State == State.Pending))
            .FirstOrDefaultAsync(identity => identity.Id == id);

        if (userProfile?.Attributes == null) return BadRequest();

        // Get some recommendations,
        // but it's very much possible that you can run out of people to match with... so hopefully not
        List<string>? elasticSearchQuery = await _elasticService.GetSimilarAttributes(userProfile.Attributes);
        if (elasticSearchQuery is null) return BadRequest();

        HashSet<string> recommendationsIds = elasticSearchQuery.ToHashSet(); // You'll get out of order recommendations,
        // but damn it's fast!!
        // Converting list to hashset is faster 
        // than just creating a hashset also

        // remove people you've sent a request to already
        recommendationsIds.ExceptWith(userProfile.OutgoingMatchRequests.Select(x => x.ReceiverId));
        recommendationsIds.Remove(userProfile.Id);

        // Get Ids of pending requesters
        var pendingRequests = userProfile.IncomingMatchRequests
            .Select(request => request.SenderId);

        // add pending requests to recommendations
        recommendationsIds.UnionWith(pendingRequests);

        // Query postgres for profiles, return Ids.
        return await _userManager.Users
            .Where(user => recommendationsIds.Contains(user.Id))
            .Select(user => user.Id)
            .ToListAsync();

    }

    // retrieves the public information of a profile,
    // and it's status (either pending or suggestion)
    [Authorize]
    [HttpGet("get-public-profile")]
    public async Task<ActionResult<ProfileOutDTO>> GetProfileById(string userId)
    {
        var personalId = User.FindFirstValue(ClaimTypes.Name);
        if (personalId is null) return Unauthorized();

        // we're going to need a lot of data here...
        Profile? profile = await _userManager.Users
            .Include(profile => profile.Attributes)
            .Include(profile => profile.Pictures)
            .Include(profile => profile.OutgoingMatchRequests
                .Where(mr => mr.ReceiverId == personalId && mr.State == State.Pending))
            .FirstOrDefaultAsync(identity => identity.Id == userId);

        if (profile is null) return NotFound();

        ProfileOutDTO profileOutDto = new()
        {
            Id = profile.Id,
            UserName = profile.UserName ?? string.Empty,
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            Bio = profile.Attributes?.Bio ?? string.Empty,

            Pictures = profile.Pictures,
            SuggestionType = profile.OutgoingMatchRequests.Count == 0
                ? SuggestionType.Suggestion
                : SuggestionType.Pending // accepted and rejected profiles
            // will show up as suggestions
        };

        return profileOutDto;
    }

    [Authorize]
    [HttpPost("send-request")]
    public async Task<IActionResult> SendRequest(string receiverId)
    {
        var userId = User.FindFirstValue(ClaimTypes.Name);
        if (userId is null) return Unauthorized();

        // request to you already exists
        var matchRequest = await _profileContext.Matches
            .Include(request => request.Receiver)
            .Include(request => request.Sender) // Yes, I am retrieving the entire thing. 
            .FirstOrDefaultAsync(request => request.ReceiverId == userId && request.SenderId == receiverId);

        // You're sending a request here
        if (matchRequest is null)
        {
            MatchRequest request = new()
            {
                ReceiverId = receiverId,
                SenderId = userId,
                State = State.Pending
            };

            await _profileContext.Matches.AddAsync(request); // should fail if you've sent a request already!!!
            // which is what we want lol!!! but not the correct way
            // to handle this, I.E very bad practice. 
        }
        // You're accepting a request here, or modifying a request you may have rejected.
        else if (matchRequest.State != State.Accepted)
        {
            _profileContext.Groups.Add(new Group()
            {
                GroupName = $"{matchRequest.Receiver.UserName}-{matchRequest.Sender.UserName}",
                Profiles = { matchRequest.Sender, matchRequest.Receiver } // BUT HE SCORES!!! getting the entire
                // profile was useful after all
            });

            matchRequest.State = State.Accepted;
        }
        // Can't send a request to someone who's accepted already!
        else
        {
            return Ok("No request sent, they've already accepted!");
        }

        await _profileContext.SaveChangesAsync();

        return Ok();
    }

    [Authorize]
    [HttpPost("reject-request")]
    public async Task<IActionResult> RejectRequest(string receiverId)
    {
        var userId = User.FindFirstValue(ClaimTypes.Name);
        if (userId is null) return Unauthorized();

        // request to you already exists
        var matchRequest = await _profileContext.Matches
            .FirstOrDefaultAsync(request => request.ReceiverId == userId && request.SenderId == receiverId);

        if (matchRequest is null) return BadRequest(); // what are you doing rejecting someone from the get-go!
        // you're so mean!

        matchRequest.State = State.Rejected;
        await _profileContext.SaveChangesAsync();

        return Ok();
    }

    [Authorize]
    [HttpPost("get-matches")]
    public async Task<IActionResult> GetMatches()
    {
        var userId = User.FindFirstValue(ClaimTypes.Name);
        if (userId is null) return Unauthorized();

        var accepts = await _profileContext.Matches
            .Where(match => match.ReceiverId == userId || match.SenderId == userId
                && match.State == State.Accepted)
            .Select(match => userId == match.ReceiverId ? match.SenderId : match.ReceiverId)
            .ToListAsync();

        return Ok(accepts);
    }

    [Authorize]
    [HttpPost("get-groups")]
    public async Task<ActionResult<List<Group>>> GetGroups()
    {
        var userId = User.FindFirstValue(ClaimTypes.Name);
        if (userId is null) return Unauthorized();

        var groups = await _userManager.Users
            .Where(identity => identity.Id == userId)
            .SelectMany(user => user.Groups).ToListAsync();

        return groups;
    }

    [Authorize]
    // [HttpPost("get-messages")]
    // public async Task<ActionResult<List<Message>>> GetMessages()
    // {
    //     var userId = User.FindFirstValue(ClaimTypes.Name);
    //     if (userId is null) return Unauthorized();
    //     
    //     
    // }

    [Authorize]
    [HttpPost("create-group")]
    public async Task<IActionResult> CreateGroup(List<string> userIds)
    {
        var userId = User.FindFirstValue(ClaimTypes.Name);
        if (userId is null) return Unauthorized();
        
        var accepts = await _profileContext.Matches
            .Where(match => match.ReceiverId == userId || match.SenderId == userId
                && match.State == State.Accepted)
            .Select(match => userId == match.ReceiverId ? match.SenderId : match.ReceiverId)
            .ToHashSetAsync();
        
        accepts.IntersectWith(userIds); // ONLY add the people you have matched with

        var profiles = await _profileContext.Users
            .Where(x => accepts.Contains(x.Id))
            .ToListAsync();
        
        var group = new Group()
        {
            Profiles = profiles,
        };
        
        _profileContext.Groups.Add(group);
        
        await _profileContext.SaveChangesAsync();
        
        return Ok(group);
    }
}