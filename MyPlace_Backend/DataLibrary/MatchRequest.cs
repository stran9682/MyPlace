namespace DataLibrary;

public class MatchRequest
{
    public int Id { get; set; }
    
    public string SenderId { get; set; } = null!;
    public Profile Sender { get; set; } = null!;
    
    public string ReceiverId { get; set; } = null!;
    public Profile Receiver { get; set; } = null!;
    
    public State State { get; set; }
}

public enum State
{
    Pending,
    Rejected,
    Accepted
}