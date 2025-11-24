using DataLibrary;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MigrationApplication.Configurations;
using MigrationApplication.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ProfileContext>(options => // connect to Postgres
    options.UseNpgsql(connectionString));

builder.Services.AddIdentity<Profile, IdentityRole>(options =>  // adding identity features
    {
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<ProfileContext>();

builder.Services.AddTransient<IdentityDataSeeder>();

builder.Services.Configure<ElasticSettings>(builder.Configuration.GetSection("ElasticSettings"));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ProfileContext>();
    db.Database.Migrate();
}

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<IdentityDataSeeder>();
    await seeder.SeedAsync();

}

Environment.Exit(0);
