using Microsoft.AspNetCore.Mvc;
using ticketApi.Services;

namespace ticketApi.Controllers
{
    [Route("api/category")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoryController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAll()
        {
            var categories = _categoryService.Categories;
            return await Task.FromResult(Ok(categories));
        }
    }
}
