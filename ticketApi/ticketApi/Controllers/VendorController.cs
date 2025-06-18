using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ticketApi.Services;

namespace ticketApi.Controllers
{
    [Route("api/vendor")]
    [ApiController]
    public class VendorController : ControllerBase
    {
        private readonly SupplierService _supplierService;

        public VendorController(SupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAll()
        {
            var suppliers = _supplierService.GetSuppliers();
            return await Task.FromResult(Ok(suppliers));
        }
    }
}
