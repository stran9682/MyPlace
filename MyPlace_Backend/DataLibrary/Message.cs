using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DataLibrary;

public class Message
{
    public int Id { get; set; }
    
    // make sure this is set to the right group!
    public int GroupId { get; set; }
    public Group? Group { get; set; }

    public string MessageText { get; set; } = null!;
    public DateTime Timestamp { get; set; }
    
    public string ProfileId { get; set; } = null!;
    public Profile? Profile { get; set; }
    
    // since retrieving the username EVERY time is a bit too much!
    public string Username { get; set; }  = null!;
    
    // ✅ Make sure these exist
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    
    [JsonIgnore]
    public virtual ICollection<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
    
    [JsonIgnore]
    public virtual ICollection<MessageReadReceipt> ReadReceipts { get; set; } = new List<MessageReadReceipt>();
    
}