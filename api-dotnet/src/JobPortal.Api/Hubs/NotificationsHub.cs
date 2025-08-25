using JobPortal.Application.DTO.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Net.NetworkInformation;
using System.Security.Claims;
using System.Threading.Tasks;

namespace JobPortal.Api.Hubs
{
    /// <summary>
    /// Real-time channel for user/org notifications and lightweight signals (typing, pings).
    /// Clients should connect with an authenticated Bearer token.
    /// </summary>
    [Authorize]
    public class NotificationsHub : Hub<INotificationsClient>
    {
        /// <summary>Group prefix used for per-organization broadcasts.</summary>
        public const string OrgGroupPrefix = "org:";

        /// <summary>Group prefix used for per-user broadcasts.</summary>
        public const string UserGroupPrefix = "user:";

        private string? CurrentUserId =>
            Context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ??
            Context.User?.FindFirstValue("sub");

        public override async Task OnConnectedAsync()
        {
            // Auto-join the caller’s user group (if we can resolve the user id)
            if (!string.IsNullOrWhiteSpace(CurrentUserId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, UserGroupPrefix + CurrentUserId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Nothing special required; server-side group membership is connection-scoped.
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>Join an organization group to receive org-wide events (e.g., new job created).</summary>
        public Task JoinOrg(Guid orgId) =>
            Groups.AddToGroupAsync(Context.ConnectionId, OrgGroupPrefix + orgId);

        /// <summary>Leave an organization group.</summary>
        public Task LeaveOrg(Guid orgId) =>
            Groups.RemoveFromGroupAsync(Context.ConnectionId, OrgGroupPrefix + orgId);

        /// <summary>Simple client-to-group typing signal (optional use by your UI).</summary>
        public Task SendTyping(Guid orgId, string? context = null)
        {
            var userId = CurrentUserId ?? "unknown";
            var signal = new TypingSignal
            {
                OrgId = orgId,
                UserId = userId,
                Context = context,
                AtUtc = DateTime.UtcNow
            };

            return Clients.Group(OrgGroupPrefix + orgId).Typing(signal);
        }

        /// <summary>Optional ping to check connectivity / measure RTT.</summary>
        public Task Ping(string? payload = null)
            => Clients.Caller.Pong(new Pong { Payload = payload, AtUtc = DateTime.UtcNow });
    }

    /// <summary>Methods the server can push to connected clients.</summary>
    public interface INotificationsClient
    {
        Task Notification(NotificationMessage message);

        // Domain-specific events (use what you need in your UI):
        Task JobCreated(NotificationMessage message);
        Task JobUpdated(NotificationMessage message);
        Task ApplicationSubmitted(NotificationMessage message);
        Task ApplicationStatusChanged(NotificationMessage message);

        // Lightweight signals:
        Task Typing(TypingSignal signal);
        Task Pong(Pong pong);
    }
}
