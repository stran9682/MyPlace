using System.Text.Json.Serialization;

namespace DataLibrary;

public class MatchRequest
{
    public int Id { get; set; }
    
    public string SenderId { get; set; } = null!;
    
    [JsonIgnore]
    public Profile Sender { get; set; } = null!;
    
    public string ReceiverId { get; set; } = null!;
    
    [JsonIgnore]
    public Profile Receiver { get; set; } = null!;
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public State State { get; set; }
}

public enum State
{
    Pending,
    Rejected,
    Accepted
}