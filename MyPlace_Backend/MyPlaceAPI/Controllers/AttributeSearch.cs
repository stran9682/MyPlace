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
    
    [HttpPost("create-index")]
    public async Task<IActionResult> CreateIndex(string indexName)
    {
        await _elasticService.CreateIndex(indexName);
        return Ok();
    }

    [HttpPost("add-user")]
    public async Task<IActionResult> AddProfileAttributes([FromBody] ProfileAttributes profileAttributes)
    {
        var result = await  _elasticService.AddOrUpdate(profileAttributes);
        return result ? Ok() : BadRequest();
    }

    [HttpGet("get-user")]
    public async Task<IActionResult> GetProfileAttributes(string key)
    {
        var user = await _elasticService.GetAttributes(key);
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