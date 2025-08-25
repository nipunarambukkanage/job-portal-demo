using JobPortal.Application.Abstractions.Caching;
using StackExchange.Redis;
using System.Text.Json;

namespace JobPortal.Infrastructure.Caching;

public class RedisCacheService : ICacheService
{
    private readonly IDatabase _db;
    public RedisCacheService(IConnectionMultiplexer mux) => _db = mux.GetDatabase();

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        var val = await _db.StringGetAsync(key);
        if (val.IsNullOrEmpty) return default;
        return JsonSerializer.Deserialize<T>(val!);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct = default)
    {
        var json = JsonSerializer.Serialize(value);
        return _db.StringSetAsync(key, json, ttl);
    }
}
