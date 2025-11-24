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
       await _profileContext.Groups
            .Where(group => group.Profiles.Select(profile => profile.Id)
                .Contains(Context.User.FindFirst(ClaimTypes.Name).Value))
            .Select(group => group.GroupName)
            .ToListAsync();
       
       Console.WriteLine(Context.User.FindFirst(ClaimTypes.Name).Value);
    }
    
    
}