using doorx.application.Common;
using doorx.domain;

namespace doorx.application.Tenants;

public class GetAll: IUseCase
{
    public record Response(int Id, string Name);
    
    public List<Response> Execute() => 
        Tenant.GetAll().Select(tenant => new Response(tenant.Id, tenant.Name)).ToList();
}