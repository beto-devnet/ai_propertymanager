using Microsoft.EntityFrameworkCore;

namespace ticketApi.ticketApi.Data;

public class TicketDbContext : DbContext
{
    public TicketDbContext(DbContextOptions<TicketDbContext> options)
        : base(options)
    {
    }

    public DbSet<Models.Models.Ticket> Tickets { get; set; }
}