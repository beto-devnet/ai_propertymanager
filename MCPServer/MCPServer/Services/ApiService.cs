using ErrorOr;
using RestSharp;

namespace MCPServer.Services;

public class ApiService
{
    private readonly RestClient _restClient;
    private string _endpointName = string.Empty;

    public ApiService()
    {
        _restClient = new RestClient("https://localhost:7290/api/");
    }

    public void SetEndpoint(string endpoint) => _endpointName = endpoint;

    public async Task<ErrorOr<List<T>>> GetListAsync<T>(string resource)
    {
        var url = $"{_endpointName}/{resource}";
        var request = new RestRequest(url, Method.Get);
        var response = await _restClient.ExecuteAsync<List<T>>(request);

        if (!response.IsSuccessful)
            return Error.Failure($"Error fetching data from {resource}: {response.ErrorMessage}");

        return response.Data ?? new List<T>();
    }
    
    public async Task<ErrorOr<Success>> CreateAsync<T>(string resource, T payload)
    where T : class
    {
        var url = $"{_endpointName}/{resource}";
        var request = new RestRequest(url, Method.Post);
        request.AddJsonBody(payload);

        var response = await _restClient.ExecuteAsync<T>(request);

        if (!response.IsSuccessful)
        {
            return Error.Failure($"Error creating resource in {resource}: {response.ErrorMessage}");
        }

        return Result.Success;
    }
}