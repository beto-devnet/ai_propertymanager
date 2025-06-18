using Microsoft.AspNetCore.Mvc;
using ticketApi.Services;

namespace ticketApi.Endpoints
{
    [Route("api/issue")]
    [ApiController]
    public class OpenAI : ControllerBase
    {
        private readonly OpenAIService _openAiService;
        
        public OpenAI(OpenAIService openAiService) => _openAiService = openAiService;

        [HttpPost("report")]
        public async Task<IActionResult> Get(Models.Models.AssistantRequest request)
        {
            var result = await _openAiService.GetAnswerAsync(request);
            return Ok(result);
        }
    }
}