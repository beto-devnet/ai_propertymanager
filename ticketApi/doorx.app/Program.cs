using doorx.application.Common;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.Scan(scan => scan
    .FromAssemblyOf<IRecord>()
    .AddClasses(classes => classes.AssignableTo<IRecord>())
    .AsSelfWithInterfaces()
    .WithScopedLifetime()
    .FromAssemblyOf<IUseCase>()
    .AddClasses(classes => classes.AssignableTo<IUseCase>())
    .AsSelfWithInterfaces()
    .WithScopedLifetime()
);
    
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    // app.UseHsts();
}

// app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.MapControllers();
app.Run();