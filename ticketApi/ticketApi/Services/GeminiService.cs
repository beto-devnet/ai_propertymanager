using System.Text.Json;
using ErrorOr;
using RestSharp;
using ticketApi.Models;

namespace ticketApi.Services;

public class GeminiService
{
    private readonly RestClient _client;
    private readonly string _apiKey;
    private bool _disposed = false;

    public GeminiService(string apiKey)
    {
        _apiKey = apiKey;
        
        var options = new RestClientOptions("https://generativelanguage.googleapis.com")
        {
            Timeout = TimeSpan.FromSeconds(30),
            ThrowOnAnyError = false
        };

        _client = new RestClient(options);
        
        _client.AddDefaultParameter("key", _apiKey, ParameterType.QueryString);
    }

    public async Task<ErrorOr<Gemini.IssueResponse>> GenerateTextAsyncFake(string prompt)
    {
        return await Task.FromResult(new Gemini.IssueResponse()
        {
            Category = "HVAC",
            Response =
                "I'm sorry to hear that your AC is not cooling. I will make sure the right team is assigned to assist you ASAP!"
        });
    }
    public async Task<ErrorOr<Gemini.AvailabilityResponse>> FakeAvailabilityResponse(string prompt, bool isAvailable = true)
    {
        return await Task.FromResult(new Gemini.AvailabilityResponse()
        {
            IsAvailable = isAvailable,
            Response = isAvailable == false ? "The vendor is not available to take the job and contact the client, it is needed to ask to other vendor for their availability." : "It is a positively response from vendor to take the job and contact to the client"
        });
    }
    
    public async Task<ErrorOr<Gemini.DateAndTime>> DateTimeScheduledVisitFake(string prompt)
    {
        return await Task.FromResult(new Gemini.DateAndTime()
        {
            ScheduleDate = DateTime.Now.AddDays(4).ToString("yyy-MM-dd"),
            ScheduleTime = DateTime.Now.AddHours(4).ToString("HH:mm")
        });
    }
    
    public async Task<ErrorOr<Gemini.VendorFixedIssue>> IssueFixedFake(string prompt)
    {
        return await Task.FromResult(new Gemini.VendorFixedIssue()
        {
            IssueFixed = true,
            Message = "That's s wonderful news! Thank you so much for fixing the unit and validating it's cooling properly. We really appreciate your quick work and are glad everything is working well now. It's always a pleasure working with you."
        });
    }
    
    public async Task<ErrorOr<Gemini.TenantFixedIssue>> TenantConfirmedIssueFixedFake(string prompt)
    {
        return await Task.FromResult(new Gemini.TenantFixedIssue()
        {
            IssueFixed = true,
            Message = "Great news! We've closed the ticket as requested. We're so glad to hear the issue is resolved to your satisfaction. If you have any further questions or concerns, please don't hesitate to reach out!"
        });
    }

    public async Task<ErrorOr<T>> ProcessPrompt<T>(string prompt) where T: class
    {
        try
        {
            var request = new RestRequest($"/v1beta/models/gemini-2.0-flash:generateContent", Method.Post);
            request.AddQueryParameter("key", _apiKey);
            
            var config = ReflectionSchemaBuilder.CreateSchemaFromType<T>();
            
            var requestBody = new Gemini.GeminiRequest
            {
                Contents = new List<Gemini.Content>
                {
                    new Gemini.Content
                    {
                        Parts = new List<Gemini.Part>
                        {
                            new Gemini.Part { Text = prompt }
                        }
                    }
                },
                GenerationConfig = config
            };
            
            request.AddJsonBody(requestBody);
            request.AddHeader("Content-Type", "application/json");

            var response = await _client.ExecuteAsync(request);

            if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
            {
                
                var messagesJson = JsonDocument.Parse(response.Content);
                var lastMessage = messagesJson.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                var resultMapped = JsonSerializer.Deserialize<T[]>(lastMessage);
                if (resultMapped is null || resultMapped.Length == 0)
                    return Error.Failure();
                
                var firstResult = resultMapped[0];
                return (dynamic)firstResult;
            }
            else
            {
                await HandleErrorResponse(response);
                return Error.Custom(500, "Gemini.Error", "Error al procesar la solicitud.");
            }
        }
        catch (Exception ex)
        {
            return Error.Custom(500, "Gemini.Exception", $"Error al generar texto: {ex.Message}");
        }
    }
    
    private async Task<string> HandleErrorResponse(RestResponse response)
    {
        string errorMessage = $"Error HTTP {response.StatusCode}";
        
        try
        {
            if (!string.IsNullOrEmpty(response.Content))
            {
                var errorResponse = JsonSerializer.Deserialize<Gemini.GeminiErrorResponse>(response.Content, 
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                
                if (errorResponse?.Error != null)
                {
                    errorMessage = $"Error {errorResponse.Error.Code}: {errorResponse.Error.Message}";
                }
            }
        }
        catch
        {
            // Si no se puede deserializar el error, usar el mensaje básico
            errorMessage += $" - {response.Content}";
        }
        
        return errorMessage;
    }
}