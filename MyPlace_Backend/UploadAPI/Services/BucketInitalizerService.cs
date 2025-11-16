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
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}