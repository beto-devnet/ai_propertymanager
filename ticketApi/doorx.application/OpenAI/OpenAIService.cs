#pragma warning disable OPENAI001
using System.ClientModel;
using doorx.application.OpenAI.Requests;
using doorx.application.OpenAI.Responses;
using doorx.application.OpenAI.Settings;
using ErrorOr;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Assistants;
using OpenAI.Chat;

namespace doorx.application.OpenAI;

public class OpenAIService
{
    private readonly IOptions<ChatGptSettings> _options;

    private AssistantClient _assistantClient;

    public OpenAIService(IOptions<ChatGptSettings> options)
    {
        _options = options;
        
        var openAiClient = new OpenAIClient(new ApiKeyCredential(options.Value.Key));
        _assistantClient = openAiClient.GetAssistantClient();
        ChatClient _client = new(model: "gpt-4.1-mini", apiKey: options.Value.Key);
    }

    public async Task<ThreadResponse> StartThread()
    {
        var thread = await _assistantClient.CreateThreadAsync();
        return new ThreadResponse(thread.Value.Id);
    }

    public async Task<ErrorOr<ChatResponse>> IssueRequest(IssueRequest request)
    {
        var issue = MessageContent.FromText($"{request.TenantName} | {request.IssueDescription}");
        var message = await _assistantClient.CreateMessageAsync(request.ThreadId, MessageRole.User, [issue]);
        
        var run = await _assistantClient.CreateRunAsync(request.ThreadId, _options.Value.Assistant_id);
        await WaitForRunCompletion(_assistantClient, request.ThreadId, run.Value.Id);
        
        var threadMessages = _assistantClient.GetMessages(request.ThreadId);
        var responses = threadMessages.ToList();
        
        
        var assistantResponses = responses
            .Where(r => r.Role == MessageRole.Assistant)
            .Select(msg => msg.Content[0].Text)
            .ToList();

        var deserializer = new OpenAiResponseDeserializer();
        if (!deserializer.TrySerialize(assistantResponses.First(), out var response))
            return Error.Unexpected();
        
        return response;
    }
    
    public async Task<ErrorOr<ChatResponse>> AimeeMessage(MessageRequest request)
    {
        var messageContent = MessageContent.FromText($"{request.Message}");
        var message = await _assistantClient.CreateMessageAsync(request.ThreadId, MessageRole.User, [messageContent]);
        
        var run = await _assistantClient.CreateRunAsync(request.ThreadId, _options.Value.Assistant_id, new RunCreationOptions(){ ResponseFormat = AssistantResponseFormat.JsonObject});
        await WaitForRunCompletion(_assistantClient, request.ThreadId, run.Value.Id);
        
        var threadMessages = _assistantClient.GetMessages(request.ThreadId);
        var responses = threadMessages.ToList();
        
        
        var assistantResponses = responses
            .Where(r => r.Role == MessageRole.Assistant)
            .Select(msg => msg.Content[0].Text)
            .ToList();
        
        var deserializer = new OpenAiResponseDeserializer();
        if (!deserializer.TrySerialize(assistantResponses.First(), out var response))
            return Error.Unexpected();
        
        return response;
    }
    
    public async Task<ErrorOr<ChatResponse>> VendorMessage(MessageRequest request)
    {
        var messageContent = MessageContent.FromText($"vendor: {request.Message}");
        var message = await _assistantClient.CreateMessageAsync(request.ThreadId, MessageRole.User, [messageContent]);
        
        var run = await _assistantClient.CreateRunAsync(request.ThreadId, _options.Value.Assistant_id, new RunCreationOptions(){ ResponseFormat = AssistantResponseFormat.JsonObject});
        await WaitForRunCompletion(_assistantClient, request.ThreadId, run.Value.Id);
        
        var threadMessages = _assistantClient.GetMessages(request.ThreadId);
        var responses = threadMessages.ToList();
        
        
        var assistantResponses = responses
            .Where(r => r.Role == MessageRole.Assistant)
            .Select(msg => msg.Content[0].Text)
            .ToList();
        
        var deserializer = new OpenAiResponseDeserializer();
        if (!deserializer.TrySerialize(assistantResponses.First(), out var response))
            return Error.Unexpected();
        
        return response;
    }
    
    public async Task<ErrorOr<ChatResponse>> TenantMessage(MessageRequest request)
    {
        var messageContent = MessageContent.FromText($"tenant: {request.Message}");
        var message = await _assistantClient.CreateMessageAsync(request.ThreadId, MessageRole.User, [messageContent]);
        
        var run = await _assistantClient.CreateRunAsync(request.ThreadId, _options.Value.Assistant_id, new RunCreationOptions(){ ResponseFormat = AssistantResponseFormat.JsonObject});
        await WaitForRunCompletion(_assistantClient, request.ThreadId, run.Value.Id);
        
        var threadMessages = _assistantClient.GetMessages(request.ThreadId);
        var responses = threadMessages.ToList();
        
        
        var assistantResponses = responses
            .Where(r => r.Role == MessageRole.Assistant)
            .Select(msg => msg.Content[0].Text)
            .ToList();
        
        var deserializer = new OpenAiResponseDeserializer();
        if (!deserializer.TrySerialize(assistantResponses.First(), out var response))
            return Error.Unexpected();
        
        return  await Task.FromResult(response);
    }
    
    static async Task WaitForRunCompletion(AssistantClient assistantClient, string threadId, string runId)
    {
        RunStatus status;
        do
        {
            await Task.Delay(1000); // Esperar 1 segundo
            var runStatus = await assistantClient.GetRunAsync(threadId, runId);
            status = runStatus.Value.Status;
            Console.WriteLine($"Estado del run: {status}");
                
        } while (status == RunStatus.InProgress || status == RunStatus.Queued);
            
        if (status == RunStatus.Failed)
        {
            var runDetails = await assistantClient.GetRunAsync(threadId, runId);
            Console.WriteLine($"Run falló: {runDetails.Value.LastError?.Message}");
        }
    }
}