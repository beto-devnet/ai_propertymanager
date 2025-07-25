using doorx.application.Common;
using doorx.domain;

namespace doorx.application.Vendors;

public class GetByCategory: IUseCase
{
    public List<Category> Execute(string categoryName)
    {
        return Category.GetAll().Where(category => category.Name == categoryName).ToList();
    }
}