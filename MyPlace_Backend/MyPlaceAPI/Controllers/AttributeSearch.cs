using DataLibrary;
using Microsoft.AspNetCore.Mvc;
using MyPlaceAPI.Services;

namespace MyPlaceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttributeSearch : ControllerBase
{
    private readonly ElasticService _elasticService;
    
    public AttributeSearch(ElasticService elasticService)
    {
        _elasticService = elasticService;
    }
    
    [HttpGet("get-user")]
    public async Task<IActionResult> GetProfileAttributes(ProfileAttributes attributes)
    {
        var user = await _elasticService.GetSimilarAttributes(attributes);
        return user != null ? Ok(user) : NotFound();
    }

    [HttpGet("get-all-users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _elasticService.GetAllAttributes();
        Console.WriteLine($"Found {users?.Count ?? 0} users");
        return users != null ? Ok(users) : NotFound();
    }

    [HttpDelete("delete-user")]
    public async Task<IActionResult> DeleteProfileAttributes(string key)
    {
        var result = await _elasticService.Delete(key);
        return result ? Ok() : BadRequest();
    }
}