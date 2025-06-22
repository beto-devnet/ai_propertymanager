using System.Text.Json.Serialization;

namespace ticketApi.Models;

public class Gemini
{
    public class GeminiRequest
    {
        [JsonPropertyName("contents")]
        public List<Content> Contents { get; set; } = new();
        
        [JsonPropertyName("generationConfig")]
        public GenerationConfig GenerationConfig  { get; set; }
    }

    public class Content
    {
        // [JsonPropertyName("parts")]
        public List<Part> Parts { get; set; } = new();
    }
    
    public class Part
    {
        // [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;
    }

    public class IssueResponse
    {
        [JsonPropertyName("response")]
        public string Response { get; set; }
    
        [JsonPropertyName("category")]
        public string Category { get; set; }
    }
    
    public class AvailabilityResponse
    {
        [JsonPropertyName("response")]
        public string Response { get; set; }
    
        [JsonPropertyName("isAvailable")]
        public bool IsAvailable { get; set; }
    }
    
    public class DateAndTime
    {
        [JsonPropertyName("scheduleDate")]
        public string ScheduleDate { get; set; }
    
        [JsonPropertyName("scheduleTime")]
        public string ScheduleTime { get; set; }
    }
    
    public class VendorFixedIssue
    {
        [JsonPropertyName("issueFixed")]
        public bool IssueFixed { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; }
    }
    
    public class GenerationConfig
    {
        [JsonPropertyName("responseMimeType")]
        public string MimeType { get; set; }

        [JsonPropertyName("responseSchema")]
        public ResponseSchema ResponseSchema { get; set; }
    }
    
    public class ResponseSchema
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }
    
        [JsonPropertyName("items")]
        public SchemaItems Items { get; set; }
    }
    
    public class SchemaItems
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }
    
        [JsonPropertyName("properties")]
        public SchemaProperties Properties { get; set; }
    
        // [JsonPropertyName("propertyOrdering")]
        // public string[] PropertyOrdering { get; set; }
    }
    
    public class SchemaProperty
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }
    
        [JsonPropertyName("items")]
        public SchemaProperty Items { get; set; } // Para arrays anidados
    }

    public class SchemaProperties : Dictionary<string, SchemaProperty>
    {
        public SchemaProperties() : base() { }
    
        public SchemaProperties(IDictionary<string, SchemaProperty> dictionary) : base(dictionary) { }
    }
    
    

    // public class GeminiResponse
    // {
    //     [JsonPropertyName("candidates")]
    //     public List<Candidate> Candidates { get; set; } = new();
    // }

    // public class Candidate
    // {
    //     [JsonPropertyName("content")]
    //     public Content Content { get; set; } = new();
    //
    //     [JsonPropertyName("finishReason")]
    //     public string FinishReason { get; set; } = string.Empty;
    // }
    //
    public class GeminiErrorResponse
    {
        [JsonPropertyName("error")]
        public ErrorDetails Error { get; set; } = new();
    }
    
    public class ErrorDetails
    {
        [JsonPropertyName("code")]
        public int Code { get; set; }
    
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
    
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;
    }
}