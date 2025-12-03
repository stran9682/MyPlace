namespace DataLibrary;

public class GroupDTO
{
    public string GroupName { get; set; }
    public int Id { get; set; }
    public MessageDTO? LastMessage { get; set; }
    
    public List<string> ProfileIds { get; set; }
}