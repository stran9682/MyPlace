public class ReactionDTO
{
    public string Emoji { get; set; } = string.Empty;
    public List<string> UserIds { get; set; } = new();
    public int Count { get; set; }
}