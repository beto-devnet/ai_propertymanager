namespace doorx.application.OpenAI.Requests;

public record MessageRequest(string Message, string ThreadId);

public record MessageResponse();
