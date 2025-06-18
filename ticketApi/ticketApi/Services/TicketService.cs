using ticketApi.ticketApi.Data;

namespace ticketApi.Services;

public class TicketService
{
    private readonly TicketDbContext _context;
    private readonly SupplierService _supplierService;
    private readonly List<Models.Models.Vendor> _vendors;

    public TicketService(TicketDbContext context, SupplierService supplierService)
    {
        _context = context;
        _supplierService = supplierService;
        
    }

    public IEnumerable<Models.Models.Ticket> GetTickets()
    {
        return _context.Tickets.ToList();
    }

    public Models.Models.Ticket CreateTicket(Models.Models.TicketRequest ticket)
    {
        var vendors = _supplierService.GetSuppliers();
        var vendor = vendors.Where(x => x.Id == ticket.VendorId).FirstOrDefault(); 
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