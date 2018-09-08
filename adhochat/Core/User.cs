using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace adhochat.Core
{
    public class User : IRepositoryItem<string>
    {
        public string Id { get; set; }
        public string ConnectionId { get; set; }
        public string UserName { get; set; }
    }
}
