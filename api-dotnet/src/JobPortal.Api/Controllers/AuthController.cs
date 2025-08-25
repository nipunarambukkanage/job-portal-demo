using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.Application.Abstractions.CurrentUser;
using JobPortal.Application.DTO.Users;

namespace JobPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ICurrentUser _current;

        public AuthController(ICurrentUser current)
        {
            _current = current;
        }

        /// <summary>Return the current authenticated user (from Clerk JWT).</summary>
        [HttpGet("me")]
        [Authorize]
        public ActionResult<CurrentUserDto> Me()
        {
            if (!_current.IsAuthenticated)
                return Unauthorized();

            return Ok(new CurrentUserDto
            {
                UserId = _current.UserId,
                Email = _current.Email,
                Name = _current.Name,
                Roles = _current.Roles.ToArray(),
                Claims = _current.Claims // helpful for debugging UI/auth flows
            });
        }

        /// <summary>Return raw claims (dev/debug). Remove or protect in prod.</summary>
        [HttpGet("claims")]
        [Authorize]
        public ActionResult<object> Claims()
        {
            var claims = User.Claims
                .GroupBy(c => c.Type)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Value).ToArray());

            return Ok(claims);
        }
    }
}
