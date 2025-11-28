using System.Security.Claims;
using DataLibrary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MyPlaceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessageController : ControllerBase
{
    private readonly ProfileContext _context;

    public MessageController(ProfileContext context)
    {
        _context = context;
    }

    [HttpGet("get-messages/{groupId}")]
    public async Task<ActionResult<List<Message>>> GetMessages(int groupId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    
            Console.WriteLine($"📨 GetMessages called for group {groupId} by user {userId}");
    
            if (userId == null) 
            {
                Console.WriteLine("❌ User not authenticated");
                return Unauthorized();
            }

            var group = await _context.Groups
                .Include(g => g.Profiles)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
            {
                Console.WriteLine($"❌ Group {groupId} not found");
                return NotFound("Group not found");
            }
    
            if (!group.Profiles.Any(p => p.Id == userId))
            {
                Console.WriteLine($"❌ User {userId} not in group {groupId}");
                return Forbid();
            }

            var messages = await _context.Set<Message>()
                .Where(m => m.GroupId == groupId)
                .OrderBy(m => m.Timestamp)
                .Take(100)
                .ToListAsync();

            Console.WriteLine($"✅ Returning {messages.Count} messages");
            return Ok(messages);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error in GetMessages: {ex.Message}");
            Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("get-messages/{groupId}/paginated")]
    public async Task<ActionResult<object>> GetMessagesPaginated(
        int groupId, 
        [FromQuery] int pageSize = 50, 
        [FromQuery] int? beforeMessageId = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var group = await _context.Groups
            .Include(g => g.Profiles)
            .FirstOrDefaultAsync(g => g.Id == groupId);

        if (group == null || !group.Profiles.Any(p => p.Id == userId))
        {
            return Forbid();
        }

        var query = _context.Set<Message>()
            .Where(m => m.GroupId == groupId);

        if (beforeMessageId.HasValue)
        {
            query = query.Where(m => m.Id < beforeMessageId.Value);
        }

        var messages = await query
            .OrderByDescending(m => m.Timestamp)
            .Take(pageSize)
            .ToListAsync();

        messages.Reverse(); // Return in chronological order

        return Ok(new
        {
            messages,
            hasMore = messages.Count == pageSize
        });
    }

    [HttpGet("get-user-groups")]
    public async Task<ActionResult> GetUserGroups()
    {
        var userId = User.FindFirstValue(ClaimTypes.Name);
        if (userId == null) return Unauthorized();

        var groups = await _context.Groups
            .Include(g => g.Profiles)
            .Where(g => g.Profiles.Any(p => p.Id == userId))
            .Select(g => new
            {
                g.Id,
                g.GroupName,
                Members = g.Profiles.Select(p => new
                {
                    p.Id,
                    p.UserName,
                    p.FirstName,
                    p.LastName
                }).ToList(),
                LastMessage = g.Messages
                    .OrderByDescending(m => m.Timestamp)
                    .Select(m => new
                    {
                        m.Id,
                        m.MessageText,
                        m.Timestamp,
                        m.Username,
                        m.ProfileId
                    })
                    .FirstOrDefault(),
                UnreadCount = g.Messages
                    .Count(m => m.ProfileId != userId && m.Timestamp > DateTime.UtcNow.AddDays(-7))
            })
            .OrderByDescending(g => g.LastMessage != null ? g.LastMessage.Timestamp : DateTime.MinValue)
            .ToListAsync();

        return Ok(groups);
    }

    [HttpPost("create-group")]
    public async Task<ActionResult<Group>> CreateGroup([FromBody] CreateGroupRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var currentUser = await _context.Users.FindAsync(userId);
        if (currentUser == null) return Unauthorized();

        var otherUser = await _context.Users.FindAsync(request.OtherUserId);
        if (otherUser == null) return NotFound("User not found");

        // Check if group already exists between these two users
        var existingGroup = await _context.Groups
            .Include(g => g.Profiles)
            .FirstOrDefaultAsync(g => 
                g.Profiles.Count == 2 &&
                g.Profiles.Any(p => p.Id == userId) &&
                g.Profiles.Any(p => p.Id == request.OtherUserId));

        if (existingGroup != null)
        {
            return Ok(new
            {
                existingGroup.Id,
                existingGroup.GroupName,
                alreadyExists = true
            });
        }

        // Create new group
        var newGroup = new Group
        {
            GroupName = $"{currentUser.FirstName} & {otherUser.FirstName}",
            Profiles = new List<Profile> { currentUser, otherUser }
        };

        _context.Groups.Add(newGroup);
        
        await _context.SaveChangesAsync();

        return Ok(new
        {
            newGroup.Id,
            newGroup.GroupName,
            alreadyExists = false
        });
    }

    [HttpPost("create-group-with-multiple")]
    public async Task<ActionResult<Group>> CreateGroupWithMultiple([FromBody] CreateMultiGroupRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.Name);
        if (userId == null) return Unauthorized();

        var currentUser = await _context.Users.FindAsync(userId);
        if (currentUser == null) return Unauthorized();

        if (request.UserIds == null || request.UserIds.Count < 1)
        {
            return BadRequest("At least one other user is required");
        }

        var users = await _context.Users
            .Where(u => request.UserIds.Contains(u.Id))
            .ToListAsync();

        if (users.Count != request.UserIds.Count)
        {
            return NotFound("One or more users not found");
        }

        users.Add(currentUser);

        var newGroup = new Group
        {
            GroupName = request.GroupName ?? $"Group with {users.Count} members",
            Profiles = users
        };

        _context.Groups.Add(newGroup);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            newGroup.Id,
            newGroup.GroupName
        });
    }

    [HttpDelete("delete-group/{groupId}")]
    public async Task<ActionResult> DeleteGroup(int groupId)
    {
        var userId = User.FindFirstValue(ClaimTypes.Name);
        if (userId == null) return Unauthorized();

        var group = await _context.Groups
            .Include(g => g.Profiles)
            .Include(g => g.Messages)
            .FirstOrDefaultAsync(g => g.Id == groupId);

        if (group == null) return NotFound();

        if (!group.Profiles.Any(p => p.Id == userId))
        {
            return Forbid();
        }

        _context.Groups.Remove(group);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Group deleted successfully" });
    }

    [HttpPost("search-messages")]
    public async Task<ActionResult> SearchMessages([FromBody] SearchMessagesRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.Name);
        if (userId == null) return Unauthorized();

        var userGroups = await _context.Groups
            .Include(g => g.Profiles)
            .Where(g => g.Profiles.Any(p => p.Id == userId))
            .Select(g => g.Id)
            .ToListAsync();

        var messages = await _context.Set<Message>()
            .Where(m => userGroups.Contains(m.GroupId) && 
                        m.MessageText.Contains(request.SearchTerm))
            .OrderByDescending(m => m.Timestamp)
            .Take(50)
            .Select(m => new
            {
                m.Id,
                m.GroupId,
                m.MessageText,
                m.Timestamp,
                m.Username,
                m.ProfileId
            })
            .ToListAsync();

        return Ok(messages);
    }
}

public class CreateGroupRequest
{
    public string OtherUserId { get; set; } = null!;
}

public class CreateMultiGroupRequest
{
    public List<string> UserIds { get; set; } = null!;
    public string? GroupName { get; set; }
}

public class SearchMessagesRequest
{
    public string SearchTerm { get; set; } = null!;
}