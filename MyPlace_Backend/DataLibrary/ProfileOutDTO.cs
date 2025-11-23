using System.Text.Json.Serialization;

namespace DataLibrary;

public class ProfileOutDTO
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public ICollection<PictureModel> Pictures { get; set; } = new List<PictureModel>();
    public string Bio { get; set; }
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public SuggestionType? SuggestionType { get; set; }
}

public enum SuggestionType 
{
    Suggestion,
    Pending
}