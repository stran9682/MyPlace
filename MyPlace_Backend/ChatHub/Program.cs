using System.Text;
using DataLibrary;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Add DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ProfileContext>(options =>
    options.UseNpgsql(connectionString));

// Add Identity
builder.Services.AddIdentity<Profile, IdentityRole>()
    .AddEntityFrameworkStores<ProfileContext>();

// add signalR + redis backplane
builder.Services.AddSignalR()
    .AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis")!);

// JWT validation scheme and policy
// JWT validation scheme and policy
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(jwtOptions =>
    {
        jwtOptions.TokenValidationParameters = new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Tokens:Key"]!)),
            ValidIssuer = builder.Configuration["Tokens:Issuer"],
            ValidAudience = builder.Configuration["Tokens:Audience"],
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // detailed logging
        Console.WriteLine($"🔑 JWT Config:");
        Console.WriteLine($"   Key length: {builder.Configuration["Tokens:Key"]?.Length}");
        Console.WriteLine($"   Issuer: {builder.Configuration["Tokens:Issuer"]}");
        Console.WriteLine($"   Audience: {builder.Configuration["Tokens:Audience"]}");

        jwtOptions.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                Console.WriteLine($"🔍 OnMessageReceived - Path: {path}");
                Console.WriteLine($"🔍 Token from query: {!string.IsNullOrEmpty(accessToken)}");
                
                if (!string.IsNullOrEmpty(accessToken) && 
                    (path.StartsWithSegments("/chathub") || path.Value?.Contains("/chathub") == true))
                {
                    context.Token = accessToken;
                    Console.WriteLine("✅ Token received from query string for SignalR");
                }

                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"❌ Authentication failed: {context.Exception.Message}");
                Console.WriteLine($"❌ Exception type: {context.Exception.GetType().Name}");
                Console.WriteLine($"❌ Path: {context.Request.Path}");
                
                if (context.Exception.InnerException != null)
                {
                    Console.WriteLine($"❌ Inner exception: {context.Exception.InnerException.Message}");
                }
                
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var userId = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var userName = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                Console.WriteLine($"✅ Token validated - NameIdentifier: {userId}, Name: {userName}");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"⚠️ OnChallenge triggered");
                Console.WriteLine($"⚠️ Error: {context.Error}");
                Console.WriteLine($"⚠️ ErrorDescription: {context.ErrorDescription}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ChatHub API",
        Version = "v1",
        Description = "Real-time chat and messaging API"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", options =>
    {
        options.WithOrigins("http://localhost:5173", "http://localhost:5174")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true); 
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");

app.Use(async (context, next) =>
{
    Console.WriteLine($"📍 {context.Request.Method} {context.Request.Path}");
    Console.WriteLine($"📍 Origin: {context.Request.Headers["Origin"]}");
    Console.WriteLine($"📍 Has Auth: {context.Request.Headers.ContainsKey("Authorization")}");
    await next();
    Console.WriteLine($"📍 Response: {context.Response.StatusCode}");
});

app.UseWebSockets();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.MapHub<ChatHub.Hubs.ChatHub>("/chathub", options =>
{
    options.AllowStatefulReconnects = true;
});

app.Run();

