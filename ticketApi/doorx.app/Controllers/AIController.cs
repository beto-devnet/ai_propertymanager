using doorx.application.Properties;
using doorx.application.Vendor;
using Microsoft.AspNetCore.Mvc;

namespace doorx.app.Controllers
{
    [Route("api/ai")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly PropertyUseCases _propertyUseCases;
        private readonly VendorUseCases _vendorUseCases;

        public AIController(PropertyUseCases propertyUseCases, VendorUseCases vendorUseCases)
        {
            _propertyUseCases = propertyUseCases;
            _vendorUseCases = vendorUseCases;
        }

        [HttpGet]
        public IActionResult GetAllProperties()
        {
            var properties = _propertyUseCases.GetAll.Execute();
            return Ok(properties);
        }

        [HttpGet("vendor-by-category/{categoryName}")]
        public IActionResult GetVedorByCategory(string categoryName)
        {
            var result = _vendorUseCases.GetByCategory.Execute(categoryName);
            return Ok(result);
        }
    }
}
