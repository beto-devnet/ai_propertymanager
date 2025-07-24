using doorx.application.Common;
using doorx.domain;

namespace doorx.application.Properties;

public class GetAll: IUseCase
{

    public List<Property> Execute()
    {
        return Property.GetAll();
    }
}