using DataLibrary;
using Microsoft.AspNetCore.Identity;

namespace MigrationApplication.Services;

public class IdentityDataSeeder
{
    private readonly UserManager<Profile> _userManager;

    public IdentityDataSeeder(UserManager<Profile> userManager)
    {
        _userManager = userManager;
    }
    
    private async Task CreateUserAsync(Profile user, string password)
    {
        var exists = await _userManager.FindByEmailAsync(user.Email);
        if (exists == null)
            await _userManager.CreateAsync(user, password);
    }
    
    public async Task SeedAsync()
    {
        Random random = new Random();
        
        var cleanliness = random.Next(11);
        var hoursAwake = random.Next(11);
        var personality = random.Next(11);

        for (int i = 0; i < 300; i++)
        {
            ProfileAttributes attributes = new()
            {
                Cleanliness = cleanliness,
                Gender = "Male",
                HoursAwake = hoursAwake,
                Personality = personality,
                Bio = $"Chris From Tinder. Cleanliness: {cleanliness}, Personality: {personality}, HoursAwake: {hoursAwake}"
            };

            PictureModel picture = new()
            {
                FileName = "chris_tinder.png",
            };
        
            Profile newProfile = new Profile
            {
                Email = $"string{i}@string.com",
                FirstName = "Chris",
                LastName = "From Tinder",
                UserName = $"ChrisTinder{i}",
                Attributes = attributes,
                Pictures = [picture]
            };
        
            await CreateUserAsync(newProfile, "String_123");
        }
    }
}