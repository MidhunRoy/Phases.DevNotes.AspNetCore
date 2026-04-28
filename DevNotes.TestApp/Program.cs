using Phases.DevNotes.AspNetCore.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDevNotes(options =>
{
    // Optional config override: set DevNotes:Enabled=false to disable dashboard.
    options.Enabled = builder.Configuration.GetValue<bool?>("DevNotes:Enabled") ?? true;
});

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseDevNotes();

app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
