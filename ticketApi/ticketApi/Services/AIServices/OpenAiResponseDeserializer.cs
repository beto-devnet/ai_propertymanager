using System.Text.Json;
using ticketApi.Models.ChatGpt;

namespace ticketApi.Services;

public class OpenAiResponseDeserializer
{
    public bool TrySerialize(string json, out ChatResponse response)
    {
        if (string.IsNullOrEmpty(json))
        {
            var nextStep = new NextStep(false, string.Empty, string.Empty, string.Empty, string.Empty);
            response = new  ChatResponse(string.Empty, string.Empty, string.Empty, string.Empty, nextStep);
            return false;
        }
        
        // var normalizedJson = json.Replace("""```json""", "").Replace("""```""", "").Replace("\r", "").Replace("\n", "");
        var startIndex = json.IndexOf('{');
        var lastIndex = json.LastIndexOf('}');
        var length = lastIndex - startIndex + 1;
        var normalizedJson = startIndex == -1 ? json : json.Substring(startIndex, length);
        try
        {
            response = JsonSerializer.Deserialize<ChatResponse>(normalizedJson)!;
            return true;
        }
        catch (Exception e)
        {
            var nextStep = new NextStep(false, string.Empty, string.Empty, string.Empty, string.Empty);
            response = new  ChatResponse(string.Empty, string.Empty, string.Empty, string.Empty, nextStep);
            return false;
        }
    }
}