using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace DataLibrary;

public class Profile : IdentityUser
{
    [MaxLength(32)] [Required]
    public string FirstName { get; set; } = null!;

    [MaxLength(32)] [Required] 
    public string LastName { get; set; } = null!;
    
    public ProfileAttributes? Attributes { get; set; }
    public ICollection<PictureModel> Pictures { get; set; } = new List<PictureModel>();
    
    public ICollection<Profile> MatchRequests { get; set; } = new List<Profile>();
    
    public ICollection<Profile> Matches { get; set; } = new List<Profile>();
}