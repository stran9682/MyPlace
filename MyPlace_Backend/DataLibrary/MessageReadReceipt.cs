using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataLibrary;

public class MessageReadReceipt
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int MessageId { get; set; }

    [Required]
    public string ProfileId { get; set; } = string.Empty;

    public DateTime ReadAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("MessageId")]
    public virtual Message? Message { get; set; }

    [ForeignKey("ProfileId")]
    public virtual Profile? Profile { get; set; }
}