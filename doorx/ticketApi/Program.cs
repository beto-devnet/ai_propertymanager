using Microsoft.EntityFrameworkCore;
using ticketApi.Models;
using ticketApi.Services;
using ticketApi.Services.AIServices;
using ticketApi.Services.GeminiServices;
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
builder.Services.AddTransient<DemoActions>();
builder.Services.AddTransient<ChatGptService>();
builder.Services.AddTransient<ProcessGeminiService>(provider => new ProcessGeminiService("AIzaSyDvUWGoGCR-fMLnG2-eEUVqimt8x1DLrs4"));

builder.Services.Configure<AISettings>(builder.Configuration.GetSection(AISettings.SectionName));
builder.Services.Configure<ChatGptSettings>(builder.Configuration.GetSection(ChatGptSettings.SectionName));

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

