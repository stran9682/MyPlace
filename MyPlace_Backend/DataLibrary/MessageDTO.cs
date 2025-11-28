// Add these at the top of your file or in a separate DTOs folder
public class MessageDTO
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string MessageText { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string ProfileId { get; set; } = string.Empty;
    public List<string> ReadBy { get; set; } = new();
    public List<ReactionDTO> Reactions { get; set; } = new();
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
}

