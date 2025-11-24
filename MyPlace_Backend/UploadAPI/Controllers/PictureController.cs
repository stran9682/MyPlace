using System.Security.Claims;
using DataLibrary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;
using UploadAPI.Configurations;

namespace UploadAPI.Controllers;

// Picture controller 
//  For handling file uploads to minio
[ApiController]
[Route("[controller]")]
public class PictureController : Controller
{
    private readonly ProfileContext _context;
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName;
    
    public PictureController(ProfileContext context, IMinioClient minioClient, IOptions<MinioSettings> minioSettings)
    {
        _context =  context;
        _minioClient = minioClient;
        _bucketName = minioSettings.Value.BucketName;
    }
    
    [Authorize]
    [HttpPost("add-picture")]
    public async Task<IActionResult> AddPicture(IFormFile file)
    {
        var id = User.FindFirstValue(ClaimTypes.Name);
        if (id is null) return Unauthorized();
        
        //  save to postgres first
        PictureModel model = new PictureModel
        {
            ProfileId = id,
            FileName = $"{id}/{file.FileName}"
        };
    
        //  I AM COMPLETELY RELYING ON ID BEING VALID!!
        //  Postgres enforces that every attribute must have a valid profile
        var result = await _context.Pictures.AddAsync(model);
        
        try
        { 
            //  Upload a file to image bucket.
            await using var stream = file.OpenReadStream();
            
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject($"{id}/{file.FileName}")
                .WithStreamData(stream)
                .WithObjectSize(stream.Length)
                .WithContentType(file.ContentType); 
            
            await _minioClient.PutObjectAsync(putObjectArgs);
            
            await _context.SaveChangesAsync(); // only save to postgres if minio works
        }
        catch (MinioException e)
        {
            Console.WriteLine("File Upload Error: {0}", e.Message);
            return BadRequest();
        }
        
        // return a url ;)
        return Ok($"{_bucketName}/{id}/{file.FileName}");
    }
}