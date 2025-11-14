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

        ElasticsearchClientSettings clientSettings;
            
        if (_elasticSettings.Fingerprint != null)
        {
            clientSettings = new ElasticsearchClientSettings(new Uri(_elasticSettings.Url))
                .CertificateFingerprint(_elasticSettings.Fingerprint)
                // probably a bad idea to not check for null here!
                .Authentication(new BasicAuthentication(_elasticSettings.Username, _elasticSettings.Password))
                .DefaultIndex(_elasticSettings.DefaultIndex);
        }
        else
        {
            clientSettings = new ElasticsearchClientSettings(new Uri(_elasticSettings.Url))
                .DefaultIndex(_elasticSettings.DefaultIndex);
        }
        
        _client = new ElasticsearchClient(clientSettings);
    }
    
    public async Task CreateIndex(string indexName)
    {
        if (!_client.Indices.Exists(indexName).Exists)
        {
            await _client.Indices.CreateAsync(indexName);
        }
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
    
}