using DataLibrary;
using Elastic.Clients.Elasticsearch;
using Elastic.Transport;
using Microsoft.Extensions.Options;
using MyPlaceAPI.Configurations;

namespace MyPlaceAPI.Services;

public class ElasticService
{
    private readonly ElasticsearchClient _client;
    private readonly ElasticSettings _elasticSettings;
    
    public ElasticService(IOptions<ElasticSettings> settings)
    {
        _elasticSettings = settings.Value;

        ElasticsearchClientSettings clientSettings = new ElasticsearchClientSettings(new Uri(_elasticSettings.Url))
            .DefaultIndex(_elasticSettings.DefaultIndex);
            
        if (_elasticSettings.Fingerprint != null)
        {
            clientSettings
                .CertificateFingerprint(_elasticSettings.Fingerprint)
                // probably a bad idea to not check for null here!
                .Authentication(new BasicAuthentication(_elasticSettings.Username, _elasticSettings.Password));
        }
        
        _client = new ElasticsearchClient(clientSettings);
    }
    
    public async Task CreateAttributeIndex()
    {
        // ill think about it...
    }

    public async Task<bool> AddOrUpdate(ProfileAttributes attributes)
    {
        var response = await _client.IndexAsync(attributes, idx =>
            idx.Index(_elasticSettings.DefaultIndex)
                .OpType(OpType.Index));
        
        return response.IsValidResponse;
    }

    public async Task<ProfileAttributes?> GetAttributes(string key)
    {
        var response = await _client.GetAsync<ProfileAttributes>(key, g => g
            .Index(_elasticSettings.DefaultIndex));

        return response.Source;
    }

    public async Task<ProfileAttributes?> GetByProfileId(string profileId)
    {
        var response = await _client.SearchAsync<ProfileAttributes>(query => query
            .Indices(_elasticSettings.DefaultIndex).Query(forProfile => forProfile
                .Term(match => match
                    .Field(profile => profile.ProfileId).Value(profileId))));
        
        return response.IsValidResponse ?  response.Documents.First() : null;
    }

    public async Task<List<ProfileAttributes>?> GetAllAttributes()
    {
        var response = await _client.SearchAsync<ProfileAttributes>(s =>
            s.Indices(_elasticSettings.DefaultIndex));
        
        return response.IsValidResponse ?  response.Documents.ToList() : null;
    }

    public async Task<bool> Delete(string key)
    {
        var response = await _client.DeleteAsync<ProfileAttributes>(key, g =>
            g.Index(_elasticSettings.DefaultIndex));
        
        return response.IsValidResponse;
    }

    // TODO fix this up!
    public async Task<List<string>?> GetSimilarAttributes(ProfileAttributes attributes)
    {
        var response = await _client.SearchAsync<ProfileAttributes>(s => s.Query(q => q
            .MoreLikeThis(mlt => mlt
                .Fields(profileAttributes => profileAttributes.Bio)
                .Like(like => like.Text(attributes.Bio))
                .MinDocFreq(1)
                .MinTermFreq(1))));
        
        return response.IsValidResponse ?  response.Documents.Select(x => x.ProfileId).ToList() : null;
    }
}