using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace DataLibrary;

public class Profile : IdentityUser
{
    [MaxLength(32)] [Required]
    public string FirstName { get; set; } = null!;

    [MaxLength(32)] [Required] 
    public string LastName { get; set; } = null!;

    public bool IsOnline { get; set; } = false;
    
    public DateTime? LastSeen { get; set; } = null;
    
    //  I'd rather this be null
    //  than set this with some default values
    //  which might/may skew results?
    public ProfileAttributes? Attributes { get; set; }
    
    public ICollection<PictureModel> Pictures { get; set; } = new List<PictureModel>();
    
    public ICollection<MatchRequest> MatchRequests { get; set; } = new List<MatchRequest>();
    
    public ICollection<Group> Groups { get; set; } = new List<Group>();
}