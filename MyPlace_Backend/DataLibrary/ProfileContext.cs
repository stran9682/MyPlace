using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DataLibrary;

public class ProfileContext : IdentityDbContext<Profile>
{
    public ProfileContext(DbContextOptions<ProfileContext> options) : base(options) { }
    
    public DbSet<PictureModel> Pictures => Set<PictureModel>();
    
    public DbSet<ProfileAttributes> ProfileAttributes => Set<ProfileAttributes>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<PictureModel>()
            .HasOne<Profile>()
            .WithMany(p => p.Pictures)
            .HasForeignKey(s => s.ProfileId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProfileAttributes>()
            .HasOne<Profile>()
            .WithOne(p => p.Attributes)
            .HasForeignKey<ProfileAttributes>(s => s.ProfileId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}