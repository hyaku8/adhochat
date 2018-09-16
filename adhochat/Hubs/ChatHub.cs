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
        }

        public async Task SendMessage(ChatMessage message)
        {
            Chat chat = chats[message.ChatId];
            chat.Messages.Add(message);

            List<string> recipients = new List<string>();
            foreach(User user in chat.Users)
            {
                User receiver = users[user.Id];
                if (receiver.ConnectionId != Context.ConnectionId)
                    recipients.Add(receiver.ConnectionId);
            }

            await Clients.Clients(recipients).ChatCommand(ChatCommands.SendMessage(message));
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
                    id = Guid.NewGuid().ToString();
                }
                while (users[id] != null);
                user.Id = id;
                user.Name = "User " + (this.users.Count + 1);
                user.ConnectionId = Context.ConnectionId;
                this.users.Add(user);
            }
            else
            {
                user.Chats.AddRange(chats.Where(x => x.Users.Any(y => y.Id == user.Id)));
            }
            await Clients.Client(Context.ConnectionId).ChatCommand(ChatCommands.SetUser(user));

        }
    }

}
