using System.Text.Json;
using NuGet.Protocol;
using RestSharp;

namespace ticketApi.Services;

public class OpenAIService
{
    private const string ApiKey = "";
    private const string Model = "gpt-4o";
    private const string AssistantId = "asst_2P5ROtclF7iu7cvMpnzlUWkj";
    private const string ThreadId = "thread_DvjngcXcpcP9W3a3Iw4iy6MS";
    private readonly PropertyService _propertyService;
    private readonly SupplierService _supplierService;
    private const string baseUrl = "https://api.openai.com/v1";

    
    public OpenAIService(PropertyService propertyService, SupplierService supplierService)
    {
        _propertyService = propertyService;
        _supplierService = supplierService;
    }
    
    public async Task<string> GetAnswerAsync(Models.Models.AssistantRequest request)
    {
        var client = new RestClient(baseUrl);
        var headers = new Action<RestRequest>(req =>
        {
            req.AddHeader("Authorization", $"Bearer {ApiKey}");
            req.AddHeader("OpenAI-Beta", "assistants=v2");
            req.AddHeader("Content-Type", "application/json");
        });
        
        // 1. Crear thread
        // var threadRequest = new RestRequest("/threads", Method.Post);
        // headers(threadRequest);
        // var threadResponse = await client.ExecuteAsync(threadRequest);
        // var threadJson = JsonDocument.Parse(threadResponse.Content);
        // var threadId = threadJson.RootElement.GetProperty("id").GetString();
        
        // 2. Agregar mensaje al thread
        var messageRequest = new RestRequest($"/threads/{ThreadId}/messages", Method.Post);
        headers(messageRequest);
        var messageBody = new
        {
            role = "user",
            content = request.IssueDescription
        };
        messageRequest.AddStringBody(JsonSerializer.Serialize(messageBody), DataFormat.Json);
        await client.ExecuteAsync(messageRequest);
        
        // 3. Crear run
        var runRequest = new RestRequest($"/threads/{ThreadId}/runs", Method.Post);
        headers(runRequest);
        var runBody = new { assistant_id = AssistantId };
        runRequest.AddStringBody(JsonSerializer.Serialize(runBody), DataFormat.Json);
        var runResponse = await client.ExecuteAsync(runRequest);
        var runJson = JsonDocument.Parse(runResponse.Content);
        var runId = runJson.RootElement.GetProperty("id").GetString();

        // 4. Esperar a que se complete el run
        string runStatus = "queued";
        while (runStatus != "completed" && runStatus != "failed")
        {
            await Task.Delay(1500);
            var checkRunRequest = new RestRequest($"/threads/{ThreadId}/runs/{runId}");
            headers(checkRunRequest);
            var checkRunResponse = await client.ExecuteAsync(checkRunRequest);
            var runStatusJson = JsonDocument.Parse(checkRunResponse.Content);
            runStatus = runStatusJson.RootElement.GetProperty("status").GetString();
        }
        
        // 5. Leer los mensajes del thread
        var getMessagesRequest = new RestRequest($"/threads/{ThreadId}/messages");
        headers(getMessagesRequest);
        var messagesResponse = await client.ExecuteAsync(getMessagesRequest);
        var messagesJson = JsonDocument.Parse(messagesResponse.Content);
        var lastMessage = messagesJson.RootElement
            .GetProperty("data")[0]
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetProperty("value")
            .GetString();
        
        var response = lastMessage
            .Replace("""```json""", "")
            .Replace("""```""", "");
        
        return response;
    }
}