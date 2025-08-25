using System.Threading;
using System.Threading.Tasks;

namespace JobPortal.Application.Abstractions.Persistence
{
    public interface IUnitOfWork
    {
        Task<int> SaveChangesAsync(CancellationToken ct = default);
    }
}
