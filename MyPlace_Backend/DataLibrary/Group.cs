namespace DataLibrary;

public class Group
{
    public int Id { get; set; }
    public string GroupName { get; set; } = null!;
    
    // Users in a group
    public ICollection<Profile> Profiles { get; set; } = new List<Profile>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}