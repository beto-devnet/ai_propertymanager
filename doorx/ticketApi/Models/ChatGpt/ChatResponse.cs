namespace ticketApi.Models.ChatGpt;

public record ChatResponse(string ticketId, string propertyId, string category, string recommendedSolution, NextStep nextStep);
public record NextStep(bool insufficientInformation, string instruction, string actor, string responseToActor, string context);
