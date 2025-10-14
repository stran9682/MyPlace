using System.ComponentModel.DataAnnotations;

namespace DataLibrary;

public class PictureModel
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string FileName { get; set; } = null!;
    
    public string ProfileId { get; set; } = null!;
}