using Microsoft.AspNetCore.Identity;

namespace MyPlaceAPI.Data;

public class Profile : IdentityUser
{
    public string FirstName { get; set; } = "John";
    public string LastName { get; set; } = "West. Chester";
    public string? Bio { get; set; }
    public List<string> PicturesUrl { get; set; } = new List<string>();
}