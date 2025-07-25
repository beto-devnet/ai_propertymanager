using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ticketApi.Services;

namespace ticketApi.Controllers
{
    [Route("api/ticket")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly TicketService _ticketService;

        public TicketController(Services.TicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAll()
        {
            var tickets = _ticketService.GetTickets();
            return await Task.FromResult(Ok(tickets));
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTicket([FromBody] Models.Models.TicketRequest ticket)
        {
            if (ticket == null)
            {
                return BadRequest("Ticket data is required.");
            }

            var createdTicket = _ticketService.CreateTicket(ticket);
            return await Task.FromResult(CreatedAtAction(nameof(GetAll), new { id = createdTicket.Id }, createdTicket));
        }
    }
}
