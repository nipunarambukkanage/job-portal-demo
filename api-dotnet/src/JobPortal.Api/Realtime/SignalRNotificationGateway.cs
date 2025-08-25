using System;
using System.Threading;
using System.Threading.Tasks;
using JobPortal.Api.Hubs;
using JobPortal.Application.Abstractions.Messaging;
using JobPortal.Application.DTO.Notifications;
using Microsoft.AspNetCore.SignalR;

namespace JobPortal.Api.Realtime
{
    public class SignalRNotificationGateway : INotificationGateway
    {
        private readonly IHubContext<NotificationsHub, INotificationsClient> _hub;

        public SignalRNotificationGateway(IHubContext<NotificationsHub, INotificationsClient> hub)
        {
            _hub = hub;
        }

        public Task SendToUserAsync(string userId, NotificationMessage message, CancellationToken ct = default)
            => _hub.Clients.Group(NotificationsHub.UserGroupPrefix + userId).Notification(message);

        public Task SendToOrgAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default)
            => _hub.Clients.Group(NotificationsHub.OrgGroupPrefix + orgId).Notification(message);

        public Task BroadcastAsync(NotificationMessage message, CancellationToken ct = default)
            => _hub.Clients.All.Notification(message);

        public Task JobCreatedAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default)
            => _hub.Clients.Group(NotificationsHub.OrgGroupPrefix + orgId).JobCreated(message);

        public Task JobUpdatedAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default)
            => _hub.Clients.Group(NotificationsHub.OrgGroupPrefix + orgId).JobUpdated(message);

        public Task ApplicationSubmittedAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default)
            => _hub.Clients.Group(NotificationsHub.OrgGroupPrefix + orgId).ApplicationSubmitted(message);

        public Task ApplicationStatusChangedAsync(Guid orgId, NotificationMessage message, CancellationToken ct = default)
            => _hub.Clients.Group(NotificationsHub.OrgGroupPrefix + orgId).ApplicationStatusChanged(message);
    }
}
