using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using adhochat.Core;
using adhochat.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace adhochat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IRepository<string, Chat> chats;
        private readonly IRepository<string, User> users;
        private readonly IHubContext<ChatHub> hubContext;

        public ChatController(IRepository<string, Chat> chats,
            IRepository<string, User> users, IHubContext<ChatHub> hub)
        {
            this.chats = chats;
            this.users = users;
            this.hubContext = hub;
        }

        [HttpPost]
        public IActionResult CreateChat([FromBody]Chat chat)
        {
            string userId = Request.Headers.FirstOrDefault(x => x.Key == "x-adhochat-user-id").Value;
            if (userId == null || users[userId] == null)
                return BadRequest();

            int tries = 0;
            do
            {
                chat.Id = Chat.GenerateChatId();
                tries++;
            }
            while (chats[chat.Id] != null && tries < 10);

            if (string.IsNullOrEmpty(chat.Title))
                chat.Title = chat.Id;

            chat.Users.Add(users[userId]);
            chats.Add(chat);
            return Ok(chat);
        }

        [HttpPost("join/{chatId}")]
        public async Task<IActionResult> JoinChat([FromRoute]string chatId)
        {
            Chat chat = chats[chatId];
            if (chat == null)
                return NotFound();

            string userId = Request.Headers.FirstOrDefault(x => x.Key == "x-adhochat-user-id").Value;
            if (userId == null || this.users[userId] == null)
                return BadRequest();


            List<string> users = chat.Users.Select(x => x.ConnectionId).ToList();
            await this.hubContext.Clients.Clients(users)
                .ChatCommand(ChatCommands.AddUserToChat(this.users[userId], chat));

            chat.Users.Add(this.users[userId]);
            return Ok(chat);
        }

        [HttpPost("changenick")]
        public async Task<IActionResult> ChangeNick(User user)
        {
            string userId = Request.Headers.FirstOrDefault(x => x.Key == "x-adhochat-user-id").Value;
            if (userId == null || this.users[userId] == null)
                return BadRequest();

            
            this.users[userId].Name = user.Name;

            var notifyThese = this.chats
                .Where(x => x.Users.Any(y => y.Id == userId))
                .SelectMany(x => x.Users.Where(y => y.Id != userId).Select(z => z.ConnectionId)).ToList();

            await this.hubContext.Clients.Clients(notifyThese)
                .ChatCommand(ChatCommands.NameChange(this.users[userId]));

            return Ok();
        }
    }
}