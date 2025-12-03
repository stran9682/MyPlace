namespace DataLibrary;

public class MessageDTO
{
    public string MessageText { get; set; }
    public DateTime Timestamp { get; set; }
    public string Username { get; set; } 
    public string Id { get; set; }
    
    public int GroupId { get; set; }
}