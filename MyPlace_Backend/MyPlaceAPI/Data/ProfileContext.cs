using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MyPlaceAPI.Data;

public class ProfileContext : IdentityDbContext<Profile>
{
    public ProfileContext(DbContextOptions<ProfileContext> options) : base(options) { }
}