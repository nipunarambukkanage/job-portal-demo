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

    [Authorize]
    public class NotificationsHub : Hub<INotificationsClient>
    {
        public const string OrgGroupPrefix = "org:";

        public const string UserGroupPrefix = "user:";

        private string? CurrentUserId =>
            Context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ??
            Context.User?.FindFirstValue("sub");

        public override async Task OnConnectedAsync()
        {
            if (!string.IsNullOrWhiteSpace(CurrentUserId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, UserGroupPrefix + CurrentUserId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }

        public Task JoinOrg(Guid orgId) =>
            Groups.AddToGroupAsync(Context.ConnectionId, OrgGroupPrefix + orgId);

        public Task LeaveOrg(Guid orgId) =>
            Groups.RemoveFromGroupAsync(Context.ConnectionId, OrgGroupPrefix + orgId);

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

        public Task Ping(string? payload = null)
            => Clients.Caller.Pong(new Pong { Payload = payload, AtUtc = DateTime.UtcNow });
    }

    public interface INotificationsClient
    {
        Task Notification(NotificationMessage message);
        Task JobCreated(NotificationMessage message);
        Task JobUpdated(NotificationMessage message);
        Task ApplicationSubmitted(NotificationMessage message);
        Task ApplicationStatusChanged(NotificationMessage message);
        Task Typing(TypingSignal signal);
        Task Pong(Pong pong);
    }
}
