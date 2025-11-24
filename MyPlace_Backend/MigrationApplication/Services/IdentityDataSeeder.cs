using DataLibrary;
using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.Mapping;
using Elastic.Transport;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MigrationApplication.Configurations;

namespace MigrationApplication.Services;

public class IdentityDataSeeder
{
    private readonly UserManager<Profile> _userManager;
    private readonly ElasticsearchClient _client;
    private readonly string _defaultIndex;

    public IdentityDataSeeder(UserManager<Profile> userManager, IOptions<ElasticSettings> settings)
    {
        ElasticSettings elasticSettings = settings.Value;
        _defaultIndex = elasticSettings.DefaultIndex;

        ElasticsearchClientSettings clientSettings = new ElasticsearchClientSettings(new Uri(elasticSettings.Url))
            .DefaultIndex(elasticSettings.DefaultIndex);
            
        if (elasticSettings.Fingerprint != null)
        {
            clientSettings
                .CertificateFingerprint(elasticSettings.Fingerprint)
                // probably a bad idea to not check for null here!
                .Authentication(new BasicAuthentication(elasticSettings.Username, elasticSettings.Password));
        }
        
        _client = new ElasticsearchClient(clientSettings);
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
        
        for (int i = 0; i < 500; i++)
        {
            var cleanliness = random.Next(11);
            var hoursAwake = random.Next(11);
            var personality = random.Next(11);
            
            ProfileAttributes attributes = new()
            {
                Cleanliness = cleanliness,
                Gender = "Male",
                HoursAwake = hoursAwake,
                Personality = personality,
                Bio = $"Chris From Tinder. Cleanliness: {cleanliness}, Personality: {personality}, HoursAwake: {hoursAwake}",
                TraitVector = [cleanliness, personality,  hoursAwake]
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

        var profiles = await _userManager.Users
            .Select(profile => profile.Attributes)
            .ToListAsync();
        
        await _client.Indices.CreateAsync<ProfileAttributes>(index => index
            .Index(_defaultIndex)
            .Mappings(mappings => mappings
                .Properties(properties => properties
                    .IntegerNumber(x => x.Cleanliness)
                    .IntegerNumber(x => x.HoursAwake)
                    .IntegerNumber(x => x.Personality)
                    .Text(x => x.Bio)
                    .Text(x => x.Gender)
                    .Keyword(x => x.ProfileId)
                    .DenseVector(x => x.TraitVector, descriptor => descriptor
                        .Similarity(DenseVectorSimilarity.Cosine)
                        .Dims(3))
                )));
        
        var response = _client.BulkAsync(b => b
            .Index(_defaultIndex)
            .UpdateMany(profiles, (ud, u) =>
                ud.Doc(u).DocAsUpsert()));
    }
}