using DataLibrary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatHub.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ProfileContext _context;
    private readonly UserManager<Profile> _userManager;
    private static readonly Dictionary<string, string> _userConnections = new();
    private static readonly Dictionary<string, HashSet<string>> _typingUsers = new();

    public ChatHub(ProfileContext context, UserManager<Profile> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.Identity?.Name;
        if (userId != null)
        {
            _userConnections[userId] = Context.ConnectionId;
            Console.WriteLine($"User connected: {userId}");
            
            // Notify others that user is online
            await Clients.Others.SendAsync("UserOnline", userId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId != null)
        {
            _userConnections.Remove(userId);
            Console.WriteLine($"User disconnected: {userId}");
            
            // Notify others that user is offline
            await Clients.Others.SendAsync("UserOffline", userId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinGroup(int groupId)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId == null) return;

        var group = await _context.Groups
            .Include(g => g.Profiles)
            .FirstOrDefaultAsync(g => g.Id == groupId);

        if (group == null || !group.Profiles.Any(p => p.Id == userId))
        {
            throw new HubException("Not authorized to join this group");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, groupId.ToString());
        Console.WriteLine($"User {userId} joined group {groupId}");
        
        // Notify group members that user joined
        await Clients.OthersInGroup(groupId.ToString()).SendAsync("UserJoinedGroup", userId);
    }

    public async Task LeaveGroup(int groupId)
    {
        var userId = Context.User?.Identity?.Name;
        
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId.ToString());
        Console.WriteLine($"User {userId} left group {groupId}");
        
        // Notify group that user left
        if (userId != null)
        {
            await Clients.OthersInGroup(groupId.ToString()).SendAsync("UserLeftGroup", userId);
        }
    }

    public async Task SendMessage(int groupId, string messageText)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId == null) return;

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return;

        var group = await _context.Groups
            .Include(g => g.Profiles)
            .FirstOrDefaultAsync(g => g.Id == groupId);

        if (group == null || !group.Profiles.Any(p => p.Id == userId))
        {
            throw new HubException("Not authorized to send messages to this group");
        }

        var message = new Message
        {
            GroupId = groupId,
            ProfileId = userId,
            Username = user.UserName ?? "Unknown",
            MessageText = messageText,
            Timestamp = DateTime.UtcNow
        };

        _context.Add(message);
        await _context.SaveChangesAsync();

        // Stop typing indicator when message is sent
        StopTypingInGroup(groupId.ToString(), userId);

        await Clients.Group(groupId.ToString()).SendAsync("ReceiveMessage", new
        {
            message.Id,
            message.Username,
            message.MessageText,
            message.Timestamp,
            message.ProfileId
        });
    }

    public async Task DeleteMessage(int messageId, int groupId)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId == null) return;

        var message = await _context.Set<Message>()
            .FirstOrDefaultAsync(m => m.Id == messageId && m.ProfileId == userId);

        if (message == null)
        {
            throw new HubException("Message not found or unauthorized");
        }

        _context.Remove(message);
        await _context.SaveChangesAsync();

        await Clients.Group(groupId.ToString()).SendAsync("MessageDeleted", messageId);
    }

    public async Task EditMessage(int messageId, int groupId, string newText)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId == null) return;

        var message = await _context.Set<Message>()
            .FirstOrDefaultAsync(m => m.Id == messageId && m.ProfileId == userId);

        if (message == null)
        {
            throw new HubException("Message not found or unauthorized");
        }

        message.MessageText = newText;
        await _context.SaveChangesAsync();

        await Clients.Group(groupId.ToString()).SendAsync("MessageEdited", new
        {
            messageId,
            newText,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task StartTyping(int groupId)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId == null) return;

        var groupKey = groupId.ToString();
        
        if (!_typingUsers.ContainsKey(groupKey))
        {
            _typingUsers[groupKey] = new HashSet<string>();
        }

        if (_typingUsers[groupKey].Add(userId))
        {
            var user = await _userManager.FindByIdAsync(userId);
            await Clients.OthersInGroup(groupKey).SendAsync("UserTyping", new
            {
                userId,
                username = user?.UserName ?? "Unknown"
            });
        }
    }

    public async Task StopTyping(int groupId)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId == null) return;

        var groupKey = groupId.ToString();
        StopTypingInGroup(groupKey, userId);

        await Clients.OthersInGroup(groupKey).SendAsync("UserStoppedTyping", userId);
    }

    private void StopTypingInGroup(string groupKey, string userId)
    {
        if (_typingUsers.ContainsKey(groupKey))
        {
            _typingUsers[groupKey].Remove(userId);
            
            if (_typingUsers[groupKey].Count == 0)
            {
                _typingUsers.Remove(groupKey);
            }
        }
    }

    public async Task MarkMessagesAsRead(int groupId, int lastReadMessageId)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId == null) return;

        // Notify other group members that messages have been read
        await Clients.OthersInGroup(groupId.ToString()).SendAsync("MessagesRead", new
        {
            userId,
            lastReadMessageId,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task SendReaction(int messageId, int groupId, string reaction)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId == null) return;

        var user = await _userManager.FindByIdAsync(userId);
        
        await Clients.Group(groupId.ToString()).SendAsync("ReactionAdded", new
        {
            messageId,
            userId,
            username = user?.UserName ?? "Unknown",
            reaction,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task GetOnlineUsers(int groupId)
    {
        var userId = Context.User?.Identity?.Name;
        if (userId == null) return;

        var group = await _context.Groups
            .Include(g => g.Profiles)
            .FirstOrDefaultAsync(g => g.Id == groupId);

        if (group == null) return;

        var onlineUserIds = group.Profiles
            .Where(p => _userConnections.ContainsKey(p.Id))
            .Select(p => p.Id)
            .ToList();

        await Clients.Caller.SendAsync("OnlineUsers", onlineUserIds);
    }
}