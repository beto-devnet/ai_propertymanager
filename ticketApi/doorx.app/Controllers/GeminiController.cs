using doorx.application.Gemini;
using Microsoft.AspNetCore.Mvc;

namespace doorx.app.Controllers
{
    [Route("api/gemini")]
    [ApiController]
    public class GeminiController : ControllerBase
    {
        private readonly GeminiUseCases _geminiUseCases;

        public GeminiController(GeminiUseCases geminiUseCases)
        {
            _geminiUseCases = geminiUseCases;
        }

        [HttpGet("prompt/{propertyId}")]
        public IActionResult Prompt(int propertyId)
        {
            var result = _geminiUseCases.GetPrompt.Execute(propertyId);
            return Ok(result);
        }
    }
}
