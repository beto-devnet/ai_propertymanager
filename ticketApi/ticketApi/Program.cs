using Microsoft.EntityFrameworkCore;
using ticketApi.Services;
using ticketApi.ticketApi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<TicketDbContext>(options => options.UseInMemoryDatabase("TicketDb"));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddTransient<OpenAIService>();
builder.Services.AddTransient<PropertyService>();
builder.Services.AddTransient<VendorService>();
builder.Services.AddTransient<CategoryService>();
builder.Services.AddTransient<TicketService>();
builder.Services.AddTransient<DemoServices>();
builder.Services.AddTransient<DemoActions>();
builder.Services.AddTransient<TenantService>();
builder.Services.AddTransient<GeminiService>(provider => new GeminiService("AIzaSyDvUWGoGCR-fMLnG2-eEUVqimt8x1DLrs4"));

builder.Services.AddCors(
    options =>
    {
        options.AddPolicy("AllowAll",
            builder =>
            {
                builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
    }
);

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");
app.MapControllers();

// app.MapGet("/hello", () => "Hello, World!");

app.Run();

