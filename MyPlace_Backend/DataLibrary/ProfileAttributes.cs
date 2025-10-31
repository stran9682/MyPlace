using System.ComponentModel.DataAnnotations;

namespace DataLibrary;

public class ProfileAttributes
{
    public int Id { get; set; }

    // required foreign key!
    public string ProfileId { get; set; } = null!;
    
    [MaxLength(Int16.MaxValue)]
    public string Bio { get; set; } = string.Empty;
    
    public int Cleanliness { get; set; }
    public int Personality { get; set; }
    public int HoursAwake { get; set; }
    public string Gender { get; set; } = string.Empty; 
}