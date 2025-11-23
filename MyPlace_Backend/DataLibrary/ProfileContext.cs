using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DataLibrary;

public class ProfileContext : IdentityDbContext<Profile>
{
    public ProfileContext(DbContextOptions<ProfileContext> options) : base(options) { }
    
    public DbSet<PictureModel> Pictures => Set<PictureModel>();
    
    public DbSet<ProfileAttributes> ProfileAttributes => Set<ProfileAttributes>();
    
    public DbSet<Group>  Groups => Set<Group>();
    
    public DbSet<MatchRequest> Matches => Set<MatchRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<MatchRequest>()
            .HasOne(mr => mr.Sender)
            .WithMany(profile => profile.OutgoingMatchRequests)
            .HasForeignKey(mr => mr.SenderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MatchRequest>()
            .HasOne(mr => mr.Receiver)
            .WithMany(profile => profile.IncomingMatchRequests)
            .HasForeignKey(mr => mr.ReceiverId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<MatchRequest>()
            .HasIndex(index => new { index.SenderId, index.ReceiverId })
            .IsUnique();
        
        modelBuilder.Entity<MatchRequest>()
            .Property(e => e.State)
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<State>(v, true));
    }
}