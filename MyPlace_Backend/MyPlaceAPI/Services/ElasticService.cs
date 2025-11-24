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
    
    public async Task<bool> AddOrUpdate(ProfileAttributes attributes)
    {
        var response = await _client.IndexAsync(attributes, idx =>
            idx.Index(_elasticSettings.DefaultIndex)
                .OpType(OpType.Index));
        
        return response.IsValidResponse;
    }
    
    public async Task<List<ProfileAttributes>?> GetAllAttributes()
    {
        var response = await _client.SearchAsync<ProfileAttributes>(s =>
            s.Indices(_elasticSettings.DefaultIndex)
                .Size(10000)
                .Query(q => q.MatchAll()));
        
        return response.IsValidResponse ?  response.Documents.ToList() : null;
    }

    public async Task<bool> Delete(string key)
    {
        var response = await _client.DeleteAsync<ProfileAttributes>(key, g =>
            g.Index(_elasticSettings.DefaultIndex));
        
        return response.IsValidResponse;
    }
    
    public async Task<List<string>?> GetSimilarAttributes(ProfileAttributes attributes)
    {
        var response = await _client.SearchAsync<ProfileAttributes>(s => s
            .Indices(_elasticSettings.DefaultIndex)
            .Knn(field => field
                .Field(profile => profile.TraitVector)
                .QueryVector(attributes.TraitVector)
                .K(100)
                .NumCandidates(100))
            .Size(100)
            .Fields(x => x
                .Field(profile => profile.ProfileId)));
        
        return response.Documents.Select(profile => profile.ProfileId).ToList();
    }
}