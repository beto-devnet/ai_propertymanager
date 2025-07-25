using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ticketApi.Services;

namespace ticketApi.Controllers
{
    [Route("api/vendor")]
    [ApiController]
    public class VendorController : ControllerBase
    {
        private readonly VendorService _vendorService;

        public VendorController(VendorService vendorService)
        {
            _vendorService = vendorService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAll()
        {
            var suppliers = _vendorService.GetSuppliers();
            return await Task.FromResult(Ok(suppliers));
        }
    }
}
