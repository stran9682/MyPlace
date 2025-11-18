using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using UploadAPI.Configurations;

namespace UploadAPI.Services;

public class BucketInitalizerService : IHostedService
{
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName;

    public BucketInitalizerService(IMinioClient minioClient, IOptions <MinioSettings> minioSettings)
    {
        _minioClient = minioClient;
        _bucketName = minioSettings.Value.BucketName;
    }
    
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        // just test if minio bucket exists
        var beArgs = new BucketExistsArgs()
            .WithBucket(_bucketName);
        bool found =  await _minioClient.BucketExistsAsync(beArgs, cancellationToken);
        if (!found)
        {
            var mbArgs = new MakeBucketArgs()
                .WithBucket(_bucketName);
            await _minioClient.MakeBucketAsync(mbArgs, cancellationToken).ConfigureAwait(false);
            
            string policyJson = $@"{{
              ""Version"": ""2012-10-17"",
              ""Statement"": [
                {{
                  ""Effect"": ""Allow"",
                  ""Principal"": {{ ""AWS"": [""*""] }},
                  ""Action"": [""s3:GetObject""],
                  ""Resource"": [""arn:aws:s3:::{_bucketName}/*""]
                }}
              ]
            }}";
            
            SetPolicyArgs args = new SetPolicyArgs()
                .WithBucket(_bucketName)
                .WithPolicy(policyJson);
            
            await _minioClient.SetPolicyAsync(args, cancellationToken);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}