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
           .Where(identity => identity.Id == Context.UserIdentifier)
           .SelectMany(user => user.Groups)
           .Select(group => group.Id)
           .ToListAsync();
       
       foreach (var group in groupIds)
       {
           await Groups.AddToGroupAsync(Context.ConnectionId, group.ToString());
       }
       
       await base.OnConnectedAsync();
    }

    public async Task SendMessage(MessageDTO message)
    {
        message.Id = Context.UserIdentifier;
        message.Username = Context.User.Identity.Name;
        
        await Clients.Group(message.GroupId.ToString()).SendAsync("ReceiveMessage", message);
        await Clients.Group(message.GroupId.ToString()).SendAsync("UpdateList", message);
        
        Message messageToSend = new Message()
        {
            GroupId = message.GroupId,
            MessageText = message.MessageText,
            Timestamp = message.Timestamp,
            ProfileId = Context.UserIdentifier,
            Username = Context.User.Identity.Name,
        };

        var group = _profileContext.Groups
            .Include(group => group.Messages)
            .FirstOrDefault(group => group.Id == message.GroupId);
        
        if ( group is null ) return;
        
        group.Messages.Add(messageToSend);
        
        await _profileContext.SaveChangesAsync();
    }
}