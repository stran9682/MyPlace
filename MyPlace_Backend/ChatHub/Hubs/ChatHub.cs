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
        // This is actually unbelievable. Absolutely never do this. 
        // I made the mistake of using name for the id... now we suffer the consequences.
        var username = _profileContext.Users
            .Where(identity => identity.Id == Context.UserIdentifier)
            .Select(profile => profile.UserName)
            .FirstOrDefault();

        if (username == null) return;
        
        Message messageToSend = new Message()
        {
            GroupId = message.GroupId,
            MessageText = message.MessageText,
            Timestamp = message.Timestamp,
            ProfileId = Context.UserIdentifier,
            Username = username
        };
        
        message.Username = username;
        
        await Clients.Group(message.GroupId.ToString()).SendAsync("ReceiveMessage", message);
        await Clients.Group(message.GroupId.ToString()).SendAsync("UpdateList", message);

        var group = _profileContext.Groups
            .Include(group => group.Messages)
            .FirstOrDefault(group => group.Id == message.GroupId);
        
        if ( group is null ) return;
        
        group.Messages.Add(messageToSend);
        
        await _profileContext.SaveChangesAsync();
    }
}