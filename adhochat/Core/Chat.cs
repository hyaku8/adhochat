using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace adhochat.Core
{
    public class Chat : IRepositoryItem<string>
    {
        public string Id { get; set; }
        public List<string> Users { get; set; }
        private ConcurrentBag<ChatMessage> messages;

        public ConcurrentBag<ChatMessage> Messages
        {
            get
            {
                return this.messages;
            }
        }

        public Chat()
        {
            this.messages = new ConcurrentBag<ChatMessage>();
            this.Users = new List<string>();
        }

        public IEnumerable<ChatMessage> Get(int startingFrom)
        {
            return this.messages.Skip(startingFrom);
        }

    }
}
