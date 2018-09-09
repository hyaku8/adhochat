using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace adhochat.Core
{
    public class ChatCommand<T>
    {
        public string Command { get; set; }
        public List<T> Parameters { get; set; }

        public ChatCommand()
        {
            this.Parameters = new List<T>();
        }
    }


    public static class ChatCommands
    {

        public static async Task ChatCommand<T> (this IClientProxy client, ChatCommand<T> command)
        {
            await client.SendAsync("adhc_msg", command);
        }

        public static ChatCommand<ChatMessage> SendMessage(ChatMessage message)
        {
            return new ChatCommand<ChatMessage>()
            {
                Command = "msg",
                Parameters = new List<ChatMessage>() { message }
            };
        }

        public static ChatCommand<User> SetUser(User user)
        {
            return new ChatCommand<User>()
            {
                Command = "set_user",
                Parameters = new List<User>() { user }
            };
        }

        public static ChatCommand<Chat> AddChat(Chat chat)
        {
            return new ChatCommand<Chat>()
            {
                Command = "add_chat",
                Parameters = new List<Chat>() { chat }
            };
        }
    }
}
