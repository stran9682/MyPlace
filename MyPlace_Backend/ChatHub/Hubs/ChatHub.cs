using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

using DataLibrary;
namespace ChatHub.Hubs;

// [Authorize] -- This will have to be removed in order for Chathub to be working
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

    // Helper method to get userId from query string token
    private string? GetUserIdFromToken()
    {
        // Try to get from authenticated context first
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? Context.User?.FindFirst(ClaimTypes.Name)?.Value
                     ?? Context.User?.Identity?.Name;
        
        if (!string.IsNullOrEmpty(userId))
        {
            return userId;
        }

        // If not authenticated via context, try to decode token from query string
        var httpContext = Context.GetHttpContext();
        var token = httpContext?.Request.Query["access_token"].ToString();
        
        if (!string.IsNullOrEmpty(token))
        {
            try
            {
                // Decode JWT token manually
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                
                userId = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
                         ?? jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value
                         ?? jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                
                Console.WriteLine($"✅ Decoded userId from token: {userId}");
                return userId;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to decode token: {ex.Message}");
            }
        }
        
        return null;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserIdFromToken();
        
        Console.WriteLine($"🔌 User connected - ConnectionId: {Context.ConnectionId}");
        Console.WriteLine($"🔌 User ID: {userId}");
        
        if (string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("❌ No user ID found!");
            throw new HubException("Unauthorized");
        }

        // Store user connection
        _userConnections[userId] = Context.ConnectionId;
        
        // ✅ NEW: Notify about online status
        await Clients.All.SendAsync("UserStatusChanged", userId, true);
        await Clients.Caller.SendAsync("OnlineUsersList", _userConnections.Keys.ToList());
        
        // Notify others that user is online
        await Clients.Others.SendAsync("UserOnline", userId);

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserIdFromToken();
        
        if (userId != null)
        {
            _userConnections.Remove(userId);
            Console.WriteLine($"🔌 User disconnected: {userId}");
            
            // Remove from all typing indicators
            foreach (var groupTyping in _typingUsers.Values)
            {
                groupTyping.Remove(userId);
            }
            
            // ✅ NEW: Notify about offline status
            await Clients.All.SendAsync("UserStatusChanged", userId, false);
            
            // Notify others that user is offline
            await Clients.Others.SendAsync("UserOffline", userId);
        }
        
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinGroup(int groupId)
    {
        var userId = GetUserIdFromToken();
        
        if (userId == null)
        {
            Console.WriteLine("❌ JoinGroup: No user ID");
            throw new HubException("Unauthorized");
        }

        var group = await _context.Groups
            .Include(g => g.Profiles)
            .FirstOrDefaultAsync(g => g.Id == groupId);

        if (group == null || !group.Profiles.Any(p => p.Id == userId))
        {
            Console.WriteLine($"❌ User {userId} not authorized for group {groupId}");
            throw new HubException("Not authorized to join this group");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, groupId.ToString());
        Console.WriteLine($"✅ User {userId} joined group {groupId}");
        
        // Notify group members that user joined
        await Clients.OthersInGroup(groupId.ToString()).SendAsync("UserJoinedGroup", userId);
    }

    public async Task LeaveGroup(int groupId)
    {
        var userId = GetUserIdFromToken();
        
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId.ToString());
        Console.WriteLine($"✅ User {userId} left group {groupId}");
        
        // Remove from typing indicator for this group
        var groupKey = groupId.ToString();
        if (_typingUsers.ContainsKey(groupKey) && userId != null)
        {
            _typingUsers[groupKey].Remove(userId);
        }
        
        // Notify group that user left
        if (userId != null)
        {
            await Clients.OthersInGroup(groupId.ToString()).SendAsync("UserLeftGroup", userId);
        }
    }

   public async Task SendMessage(int groupId, string messageText)
    {
        try
        {

            var userId = GetUserIdFromToken();

            Console.WriteLine($"📨 SendMessage called - GroupId: {groupId}, UserId: {userId}");
            Console.WriteLine($"📨 Message: {messageText}");


            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("❌ Unauthorized: No user ID");
                throw new HubException("Unauthorized");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                Console.WriteLine($"❌ User not found: {userId}");
                throw new HubException("User not found");
            }

            var group = await _context.Groups
                .Include(g => g.Profiles)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
            {
                Console.WriteLine($"❌ Group not found: {groupId}");
                throw new HubException("Group not found");
            }

            if (!group.Profiles.Any(p => p.Id == userId))
            {
                Console.WriteLine($"❌ User {userId} not in group {groupId}");
                throw new HubException("Not authorized to send messages to this group");
            }

            var message = new Message
            {
                GroupId = groupId,
                ProfileId = userId,
                Username = user.UserName ?? "Unknown",
                MessageText = messageText,
                Timestamp = DateTime.UtcNow,
                //FileUrl = fileUrl,      // ✅ NEW
                //FileName = fileName     // ✅ NEW
            };

            Console.WriteLine($"💾 Saving message to database...");
            _context.Add(message);

            try
            {
                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Message saved! ID: {message.Id}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to save message: {ex.Message}");
                Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
                throw;
            }

            // Stop typing indicator
            StopTypingInGroup(groupId.ToString(), userId);

            // ✅ Broadcast the message to the group
            await Clients.Group(groupId.ToString()).SendAsync("ReceiveMessage", new
            {
                id = message.Id,              // ✅ lowercase
                username = message.Username,   // ✅ lowercase
                messageText = message.MessageText,  // ✅ camelCase
                timestamp = message.Timestamp,      // ✅ lowercase
                profileId = message.ProfileId,      // ✅ camelCase
                readBy = new List<string>(),
                reactions = new List<object>(),
                fileUrl = message.FileUrl,          // ✅ camelCase
                fileName = message.FileName         // ✅ camelCase
            });

            Console.WriteLine($"✅ Message broadcast to group {groupId}");

            // ✅ Notify all group members to update their chat list
            foreach (var member in group.Profiles)
            {
                if (_userConnections.TryGetValue(member.Id, out var connectionId))
                {
                    await Clients.Client(connectionId).SendAsync("UpdateChatList", groupId);
                    Console.WriteLine($"✅ Notified user {member.Id} to update chat list");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"🔥🔥🔥 EXCEPTION IN SendMessage: {ex.Message}");
            Console.WriteLine($"🔥🔥🔥 Stack trace: {ex.StackTrace}");
            Console.WriteLine($"🔥🔥🔥 Inner exception: {ex.InnerException?.Message}");
            throw;
        }
    }

    public async Task DeleteMessage(int messageId, int groupId)
    {
        var userId = GetUserIdFromToken();
        
        if (userId == null)
        {
            throw new HubException("Unauthorized");
        }

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

    public async Task NotifyUserJoined(int groupId, string username)
    {
        await Clients.Group(groupId.ToString()).SendAsync("userJoinedGroup", new
        {
            groupId = groupId,
            username = username,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyUserLeft(int groupId, string username)
    {
        await Clients.Group(groupId.ToString()).SendAsync("userLeftGroup", new
        {
            groupId = groupId,
            username = username,
            timestamp = DateTime.UtcNow
        });
    }

    public async Task EditMessage(int messageId, int groupId, string newText)
    {
        var userId = GetUserIdFromToken();
        
        if (userId == null)
        {
            throw new HubException("Unauthorized");
        }

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
        var userId = GetUserIdFromToken();
        
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
        var userId = GetUserIdFromToken();
        
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

    // ✅ NEW: Mark message as read (with database persistence)
    public async Task MarkMessageAsRead(int messageId)
    {
        var userId = GetUserIdFromToken();
        
        if (userId == null)
        {
            throw new HubException("Unauthorized");
        }

        Console.WriteLine($"✓ User {userId} marking message {messageId} as read");

        var message = await _context.Message
            .Include(m => m.Group)
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message == null)
        {
            throw new HubException("Message not found");
        }

        var isMember = await _context.Groups
            .AnyAsync(g => g.Id == message.GroupId && g.Profiles.Any(p => p.Id == userId));

        if (!isMember)
        {
            throw new HubException("You are not a member of this group");
        }

        // Check if already marked as read
        var existingReceipt = await _context.MessageReadReceipts
            .FirstOrDefaultAsync(mrr => mrr.MessageId == messageId && mrr.ProfileId == userId);

        if (existingReceipt == null)
        {
            var readReceipt = new MessageReadReceipt
            {
                MessageId = messageId,
                ProfileId = userId,
                ReadAt = DateTime.UtcNow
            };

            _context.MessageReadReceipts.Add(readReceipt);
            await _context.SaveChangesAsync();

            Console.WriteLine($"✅ Read receipt saved to database");
        }

        await Clients.Group(message.GroupId.ToString()).SendAsync("MessageRead", messageId, userId);
    }

    // ✅ NEW: Add reaction (with database persistence)
    public async Task AddReaction(int messageId, string emoji)
{
    var userId = GetUserIdFromToken();
    
    if (userId == null)
    {
        throw new HubException("Unauthorized");
    }

    Console.WriteLine($"😊 User {userId} adding reaction {emoji} to message {messageId}");

    // ✅ Use the fixed query from earlier
    var message = await _context.Message
        .AsNoTracking()
        .Where(m => m.Id == messageId)
        .Select(m => new { m.Id, m.GroupId })
        .FirstOrDefaultAsync();

    if (message == null)
    {
        Console.WriteLine($"❌ Message {messageId} not found");
        throw new HubException("Message not found");
    }

    Console.WriteLine($"✅ Message found: ID={message.Id}, GroupId={message.GroupId}");

    var isMember = await _context.Groups
        .Where(g => g.Id == message.GroupId)
        .AnyAsync(g => g.Profiles.Any(p => p.Id == userId));

    if (!isMember)
    {
        Console.WriteLine($"❌ User {userId} is not a member of group {message.GroupId}");
        throw new HubException("You are not a member of this group");
    }

    Console.WriteLine($"✅ User is a member of the group");

    var existingReaction = await _context.MessageReactions
        .FirstOrDefaultAsync(mr => mr.MessageId == messageId && mr.ProfileId == userId && mr.Emoji == emoji);

    if (existingReaction == null)
    {
        var reaction = new MessageReaction
        {
            MessageId = messageId,
            ProfileId = userId,
            Emoji = emoji,
            Timestamp = DateTime.UtcNow
        };

        _context.MessageReactions.Add(reaction);
        await _context.SaveChangesAsync();

        Console.WriteLine($"✅ Reaction saved to database");
    }
    else
    {
        Console.WriteLine($"⚠️ User already reacted with {emoji}");
    }

    // ✅ Broadcast with camelCase properties
    await Clients.Group(message.GroupId.ToString()).SendAsync("ReactionAdded", messageId, emoji, userId);
    Console.WriteLine($"✅ Reaction broadcast to group {message.GroupId}");
}

    public async Task MarkMessagesAsRead(int groupId, int lastReadMessageId)
    {
        var userId = GetUserIdFromToken();
        
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
        var userId = GetUserIdFromToken();
        
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
        var userId = GetUserIdFromToken();
        
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