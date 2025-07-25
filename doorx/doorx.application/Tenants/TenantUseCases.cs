using doorx.application.Common;

namespace doorx.application.Tenants;

public record TenantUseCases(GetAll GetAll, GetIssuesExamples GetIssuesExamples) : IRecord;