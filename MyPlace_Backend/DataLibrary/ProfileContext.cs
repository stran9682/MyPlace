using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DataLibrary;

public class ProfileContext : IdentityDbContext<Profile>
{
    public ProfileContext(DbContextOptions<ProfileContext> options) : base(options) { }
    
    public DbSet<PictureModel> Pictures => Set<PictureModel>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<PictureModel>()
            .HasOne<Profile>()
            .WithMany(p => p.Pictures)
            .HasForeignKey(s => s.ProfileId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}