namespace DataLibrary;

/*
 *  Sebastian Tran
 *  Data transfer object for interacting with profiles
 */
public class ProfileDTO
{
    public string? Email { get; set; }
    public string? Password { get; set; }
    
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    
    public string? Bio { get; set; }
    
    public string? UserName { get; set; }
}