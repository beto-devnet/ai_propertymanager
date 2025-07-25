using doorx.application.Common;
using doorx.domain;

namespace doorx.application.Vendors;

public class List: IUseCase
{
    public List<Vendor> Execute()
    {
        return Vendor.GetAll();
    }
}