using doorx.application.Properties;
using doorx.application.Tenants;
using doorx.application.Vendors;
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
        
        [HttpGet("issues-examples")]
        public IActionResult GetIssueExamples()
        {
            var issueExamples = _tenantUseCases.GetIssuesExamples.Execute();
            return Ok(issueExamples);
        }
        
        [HttpGet("vendor-list")]
        public IActionResult GetVendorList()
        {
            var vendors = _vendorUseCases.List.Execute();
            return Ok(vendors);
        }

        [HttpGet("vendor-by-category/{categoryName}")]
        public IActionResult GetVedorByCategory(string categoryName)
        {
            var result = _vendorUseCases.GetByCategory.Execute(categoryName);
            return Ok(result);
        }
    }
}
