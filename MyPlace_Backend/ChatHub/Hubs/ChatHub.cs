using System.Security.Claims;
using DataLibrary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatHub.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ProfileContext _profileContext;
    
    public ChatHub(ProfileContext profileContext)
    {
        _profileContext = profileContext;
    }
    
    public override async Task OnConnectedAsync()
    {
       var groupIds = await _profileContext.Users
           .Where(identity => identity.Id == Context.User.Identity.Name)
           .SelectMany(user => user.Groups)
           .Select(group => group.Id)
           .ToListAsync();
       
       foreach (var group in groupIds)
       {
           await Groups.AddToGroupAsync(Context.User.Identity.Name, group.ToString());
       }
    }

    public async Task SendMessage(Message message)
    {
        await Clients.Group(message.GroupId.ToString()).SendAsync("ReceiveMessage", message);

        var group = _profileContext.Groups
            .Include(group => group.Messages)
            .FirstOrDefault(group => group.Id == message.GroupId);
        
        if ( group is null ) return;
        
        group.Messages.Add(message);
        
        await _profileContext.SaveChangesAsync();
    }
}