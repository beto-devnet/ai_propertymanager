using doorx.application.OpenAI;
using doorx.application.OpenAI.Requests;
using Microsoft.AspNetCore.Mvc;

namespace doorx.app.Controllers
{
    [Route("api/openai")]
    [ApiController]
    public class OpenAIController : ControllerBase
    {
        private readonly OpenAIService _openAiService;

        public OpenAIController(OpenAIService openAiService)
        {
            _openAiService = openAiService;
        }

        [HttpGet("start-thread")]
        public async Task<IActionResult> StartThead()
        {
            var result = await _openAiService.StartThread();
            return Ok(result);
        }
        
        [HttpPost("issue")]
        public async Task<IActionResult> IssueRequest([FromBody]IssueRequest request)
        {
            var response = await _openAiService.IssueRequest(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }
        
        [HttpPost("processAimeeMessage")]
        public async Task<IActionResult> ProcessAimeeMessage([FromBody]MessageRequest request)
        {
            var response = await _openAiService.AimeeMessage(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }

        [HttpPost("processVendorMessage")]
        public async Task<IActionResult> ProcessVendorMessage(MessageRequest request)
        {
            var response = await _openAiService.VendorMessage(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }
        
        [HttpPost("processTenantMessage")]
        public async Task<IActionResult> ProcessTenantMessage(MessageRequest request)
        {
            var response = await _openAiService.TenantMessage(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }
    }
}
