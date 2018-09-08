using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using adhochat.Core;

namespace adhochat.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IRepository<string, User> users;
        private readonly IRepository<string, Chat> chats;

        public ChatHub(IRepository<string,User> users, IRepository<string,Chat> chats)
        {
            this.users = users;
            this.chats = chats;

            this.chats.Add(new Chat()
            {
                Id = "geh",
            });
        }

        public async Task SendMessage(ChatMessage message)
        {
            Chat chat = chats[message.ChatId];
            chat.Messages.Add(message);

            List<string> recipients = new List<string>();
            foreach(string userId in chat.Users)
            {
                User receiver = users[userId];
                if (receiver.ConnectionId != Context.ConnectionId)
                    recipients.Add(receiver.ConnectionId);
            }

            await Clients.Clients(recipients).ChatCommand(ChatCommands.SendMessage(message));
        }

        public async Task CreateChat()
        {

        }

        public async Task JoinChat(string code)
        {
        }

        public async Task Init(string userId)
        {
            User user = users[userId];
            if(user == null)
            {
                user = new User();
                string id = null;
                do
                {
                    id = new Guid().ToString();
                }
                while (users[id] != null);
                user.Id = id;
                user.ConnectionId = Context.ConnectionId;
                this.users.Add(user);
                this.chats["geh"].Users.Add(user.Id);
            }
            await Clients.Client(Context.ConnectionId).ChatCommand(ChatCommands.SetUser(user));

        }
    }
}
