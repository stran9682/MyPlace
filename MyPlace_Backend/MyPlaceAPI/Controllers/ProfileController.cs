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

[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly UserManager<Profile> _userManager;
    private readonly SignInManager<Profile> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ElasticService  _elasticService;
    
    public ProfileController(
        UserManager<Profile> userManager, 
        SignInManager<Profile> signInManager,
        IConfiguration configuration,
        ElasticService  elasticService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _elasticService = elasticService;
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
    public async Task<ActionResult<Attribute>> UpdateProfile([FromBody] AttributeDTO attribute)
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

        foreach(var propertyPair in propertyMap)
        {
            var toValue = propertyPair.Item2.GetValue(attribute, null);
            if (toValue != null)
            {
                propertyPair.Item1.SetValue(profile.Attributes, toValue, null);
            }
        }
        
        await _userManager.UpdateAsync(profile);

        // pass this into elastic search. Everything should be filled in too ;)
        await  _elasticService.AddOrUpdate(profile.Attributes);
        
        return Ok(profile.Attributes);
    }

    private string GenerateJwtToken(Profile profile)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, profile.Id),
            
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // JWT ID
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

    [HttpGet("getprofile")]
    public async Task<ActionResult<List<Profile>>> GetProfile()
    {
        var profiles = await _userManager.Users
            .Include(profile => profile.Pictures)
            .Include(profile => profile.Attributes)
            .Include(profile => profile.MatchRequests)
            .ToListAsync();
        
        return profiles;
    }
}