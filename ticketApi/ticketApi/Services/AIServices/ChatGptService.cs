#pragma warning disable OPENAI001
using System.ClientModel;
using ErrorOr;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Assistants;
using OpenAI.Chat;
using ticketApi.Models.ChatGpt;

namespace ticketApi.Services.AIServices;

public class ChatGptService
{
    private readonly IOptions<ChatGptSettings> _options;

    private AssistantClient _assistantClient;

    public ChatGptService(IOptions<ChatGptSettings> options)
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


    #region FakeCalls
    public async Task<ErrorOr<ChatResponse>> IssueRequestFake(IssueRequest request)
    {
        var json = @"```json
{
  ""ticketId"": ""Douglas Loyo | There are roaches on the first floor and kitchen area."",
  ""propertyId"": ""2"",
  ""category"": ""pest control"",
  ""likelyCause"": ""The presence of roaches may be due to leftover food, moisture, or unsealed entry points in the kitchen and first floor."",
  ""recommendedSolution"": ""Hello Douglas, thank you for notifying us about the roach issue. As per your lease agreement, the landlord is responsible for pest control issues. We will contact a pest control service to address this matter promptly."",
  ""nextStep"": {
    ""insufficientInformation"": false,
    ""instruction"": ""SendSMS"",
    ""context"": ""Contact a qualified pest control service provider to handle the roach problem.""
  }
}```";
        
        var deserializer = new OpenAiResponseDeserializer();
        if (!deserializer.TrySerialize(json, out var response))
            return Error.Unexpected();
        
        return  await Task.FromResult(response);
    }
    
    public async Task<ErrorOr<ChatResponse>> VendorMessageFake(MessageRequest request, string responseType)
    {
        var json = string.Empty;
        if (responseType == "take-job")
        {
            json = @"```json
{
  ""ticketId"": ""Douglas Loyo | There are roaches on the first floor and kitchen area."",
  ""propertyId"": ""2"",
  ""category"": ""pest control"",
  ""likelyCause"": ""The presence of roaches may be due to leftover food, moisture, or unsealed entry points in the kitchen and first floor."",
  ""recommendedSolution"": ""Hello Douglas, great news! Our pest control vendor has accepted the job and will be reaching out to you directly to schedule the most convenient time for the service. Please feel free to let me know if there are any other concerns."",
  ""nextStep"": {
    ""insufficientInformation"": false,
    ""instruction"": ""Wait"",
    ""context"": ""For the vendor to contact Douglas and proceed with the pest control service.""
  }
}```";
            
        }
        else if (responseType == "scheduled")
        {
            json = @"```json
{
  ""ticketId"": ""Douglas Loyo | There are roaches on the first floor and kitchen area."",
  ""propertyId"": ""2"",
  ""category"": ""pest control"",
  ""likelyCause"": ""The presence of roaches may be due to leftover food, moisture, or unsealed entry points in the kitchen and first floor."",
  ""recommendedSolution"": ""Hi Douglas, I wanted to update you that the pest control vendor has scheduled to visit your property today around 2pm. They will take appropriate action to address the roach issue. Please let us know if you need any further assistance."",
  ""nextStep"": {
    ""insufficientInformation"": false,
    ""instruction"": ""Wait"",
    ""context"": ""For the pest control vendor to complete the service and provide an update.""
  }
}```";
        }
        else if(responseType == "fixed")
        {
            json = @"```json
{
  ""ticketId"": ""Douglas Loyo | There are roaches on the first floor and kitchen area."",
  ""propertyId"": ""2"",
  ""category"": ""pest control"",
  ""likelyCause"": ""German roaches were found and treated."",
  ""recommendedSolution"": ""Hi Douglas, the pest control vendor has successfully addressed the issue by treating the German roaches found at your property. Please monitor the situation and let us know if you notice any further pest activity. Thank you for your patience and cooperation."",
  ""nextStep"": {
    ""insufficientInformation"": false,
    ""instruction"": ""replyToTenant"",
    ""context"": ""Update Douglas on the completion of the pest control service and encourage follow-up if needed.""
  }
}```";
        }
        
        var deserializer = new OpenAiResponseDeserializer();
        if (!deserializer.TrySerialize(json, out var response))
            return Error.Unexpected();
        
        return  await Task.FromResult(response);
    }
    
    public async Task<ErrorOr<ChatResponse>> TenantMessageFake(MessageRequest request)
    {
        var json = @"```json
{
  ""ticketId"": ""Douglas Loyo | There are roaches on the first floor and kitchen area."",
  ""propertyId"": ""2"",
  ""category"": ""pest control"",
  ""likelyCause"": ""German roaches were found and treated."",
  ""recommendedSolution"": ""Thank you so much for the 5-star rating, Douglas! We're thrilled to hear that you were satisfied with the promptness of our service. If there's anything else you need, feel free to reach out anytime."",
  ""nextStep"": {
    ""insufficientInformation"": false,
    ""instruction"": ""CloseTicket"",
    ""context"": ""The tenant has provided feedback and a star rating. Closing the ticket as the issue is resolved.""
  }
}```";
        
        var deserializer = new OpenAiResponseDeserializer();
        if (!deserializer.TrySerialize(json, out var response))
            return Error.Unexpected();
        
        return  await Task.FromResult(response);
    }
    
    #endregion
}