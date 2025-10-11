using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace DataLibrary;

public class Profile : IdentityUser
{
    [MaxLength(32)]
    public string FirstName { get; set; } = String.Empty;
    
    [MaxLength(32)]
    public string LastName { get; set; } = String.Empty;
    
    [MaxLength(Int16.MaxValue)]
    public string? Bio { get; set; }
    
    public ICollection<PictureModel> Pictures { get; set; } = new List<PictureModel>();
}