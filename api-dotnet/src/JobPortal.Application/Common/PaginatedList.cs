namespace JobPortal.Application.Common;

public sealed class PaginatedList<T>(IReadOnlyList<T> items, int page, int pageSize, int total)
{
    public IReadOnlyList<T> Items { get; } = items;
    public int Page { get; } = page;
    public int PageSize { get; } = pageSize;
    public int Total { get; } = total;
}
