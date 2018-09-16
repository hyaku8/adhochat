using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace adhochat.Core
{
    public class ChatMessage
    {
        public string UserId { get; set; }
        public string ChatId { get; set; }
        public string Content { get; set; }
    }
}
