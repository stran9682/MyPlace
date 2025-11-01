using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ChatHub.Hubs;

//[Authorize]
public class ChatHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        Console.WriteLine(Context.User.Identity.Name);
    }
}