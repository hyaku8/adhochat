using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using adhochat.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace adhochat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IRepository<string, Chat> chats;
        private readonly IRepository<string, User> users;

        public ChatController(IRepository<string, Chat> chats, IRepository<string, User> users)
        {
            this.chats = chats;
            this.users = users;
        }

        [HttpPost]
        public IActionResult CreateChat([FromBody]Chat chat)
        {
            string userId = Request.Headers.FirstOrDefault(x => x.Key == "x-adhochat-user-id").Value;
            if (userId == null)
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

            chat.Users.Add(users[userId].Id);
            chats.Add(chat);
            return Ok(chat);
        }

        [HttpPost("join/{chatId}")]
        public IActionResult JoinChat([FromRoute]string chatId)
        {
            Chat chat = chats[chatId];
            if (chat == null)
                return NotFound();

            string userId = Request.Headers.FirstOrDefault(x => x.Key == "x-adhochat-user-id").Value;
            if (userId == null)
                return BadRequest();

            chat.Users.Add(userId);
            return Ok(chat);
        }


    }
}