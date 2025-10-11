using System.ComponentModel.DataAnnotations;

namespace DataLibrary;

public class PictureModel
{
    public int Id { get; set; }
    
    [MaxLength(100)]
    public string FileName { get; set; } = string.Empty;

    public string ProfileId { get; set; } = null!;
}