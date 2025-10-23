using DataLibrary;
using Microsoft.AspNetCore.Mvc;

namespace UploadAPI.Controllers;

public class PictureController : Controller
{
    private readonly ProfileContext _context;
    
    public PictureController(ProfileContext context)
    {
        _context =  context;
    }
    
    /*
     *  What you ABSOLUTELY NEED TO DO!
     *      Use the picture DbSet instead!
     *      Postgres knows that every picture MUST be with a profile
     *      and will match a profile with a picture always
     *      It's really hard to be an idiot here...
     *      No retrieving the entire profile first, just update
     */
    [HttpPost("add_picture")]
    public async Task<IActionResult> AddPicture(string id, string fileName)
    {
        PictureModel model = new PictureModel()
        {
            ProfileId = id,
            FileName = fileName
        };
    
        var result = await _context.Pictures.AddAsync(model);
        
        await _context.SaveChangesAsync();
        return Ok();
    }
}