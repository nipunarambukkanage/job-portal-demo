using System;
using System.Threading;
using System.Threading.Tasks;
using JobPortal.Application.DTO.Notifications;

namespace JobPortal.Application.Abstractions.Messaging
{
    public interface INotificationGateway
    {
        // User-scoped
        Task SendToUserAsync(string userId, NotificationMessage message, CancellationToken ct = default);

        // Org-scoped
        Task SendToOrgAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default);

        // Broadcast to everyone connected
        Task BroadcastAsync(NotificationMessage message, CancellationToken ct = default);

        // Convenience events
        Task JobCreatedAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default);
        Task JobUpdatedAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default);
        Task ApplicationSubmittedAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default);
        Task ApplicationStatusChangedAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default);
    }
}
