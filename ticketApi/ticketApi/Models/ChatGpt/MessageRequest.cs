namespace ticketApi.Models.ChatGpt;

public record MessageRequest(string Message, string ThreadId);

public record MessageResponse();
