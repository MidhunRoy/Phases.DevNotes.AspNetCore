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

// DevNotes runs first so the dashboard and lightweight API stay available even when later middleware fails.
app.UseDevNotes();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
