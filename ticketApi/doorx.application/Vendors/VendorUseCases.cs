using doorx.application.Common;

namespace doorx.application.Vendors;

public record VendorUseCases(GetByCategory GetByCategory, List List): IRecord;