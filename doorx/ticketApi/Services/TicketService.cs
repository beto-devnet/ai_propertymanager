using ticketApi.ticketApi.Data;

namespace ticketApi.Services;

public class TicketService
{
    private readonly TicketDbContext _context;
    private readonly VendorService _vendorService;
    private readonly List<Models.Models.Vendor> _vendors;

    public TicketService(TicketDbContext context, VendorService vendorService)
    {
        _context = context;
        _vendorService = vendorService;
        
    }

    public IEnumerable<Models.Models.Ticket> GetTickets()
    {
        return _context.Tickets.ToList();
    }

    public Models.Models.Ticket CreateTicket(Models.Models.TicketRequest ticket)
    {
        var vendors = _vendorService.GetSuppliers();
        var vendor = vendors.First(); //vendors.Where(x => x.Id == ticket.VendorId).FirstOrDefault(); 
        var newTicket = new Models.Models.Ticket
        {
            Category = ticket.Category,
            Description = ticket.Description,
            Vendor = vendor
        };
        
        _context.Tickets.Add(newTicket);
        _context.SaveChanges();
        return newTicket;
    }
}