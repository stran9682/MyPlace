using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using DataLibrary;
using Microsoft.EntityFrameworkCore;

namespace MyPlaceAPI.Controllers;

public class ProfileController : ControllerBase
{
    private readonly UserManager<Profile> _userManager;
    private readonly SignInManager<Profile> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ProfileContext _profileContext;
    
    public ProfileController(
        UserManager<Profile> userManager, 
        SignInManager<Profile> signInManager,
        IConfiguration configuration,
        ProfileContext profileContext)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
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
            UserName = profile.UserName
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

    private string GenerateJwtToken(Profile profile)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, profile.Id),
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
        var profiles = await _profileContext.Users
            .Include(profile => profile.Pictures)
            .ToListAsync();
        
        return profiles;
    }
}