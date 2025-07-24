using doorx.application.Properties;
using doorx.application.Tenants;
using doorx.application.Vendor;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace doorx.app.Controllers
{
    [Route("api/management")]
    [ApiController]
    public class ManagementController : ControllerBase
    {
        private readonly PropertyUseCases _propertyUseCases;
        private readonly VendorUseCases _vendorUseCases;
        private readonly TenantUseCases _tenantUseCases;

        public ManagementController(PropertyUseCases propertyUseCases, VendorUseCases vendorUseCases, TenantUseCases tenantUseCases)
        {
            _propertyUseCases = propertyUseCases;
            _vendorUseCases = vendorUseCases;
            _tenantUseCases = tenantUseCases;
        }
        
        [HttpGet("properties")]
        public IActionResult GetAllProperties()
        {
            var properties = _propertyUseCases.GetAll.Execute();
            return Ok(properties);
        }
        
        [HttpGet("tenants")]
        public IActionResult GetTenants()
        {
            var tenants = _tenantUseCases.GetAll.Execute();
            return Ok(tenants);
        }

        [HttpGet("vendor-by-category/{categoryName}")]
        public IActionResult GetVedorByCategory(string categoryName)
        {
            var result = _vendorUseCases.GetByCategory.Execute(categoryName);
            return Ok(result);
        }
    }
}
