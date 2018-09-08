﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace adhochat.Core
{
    public class InMemoryRepository<TKey, TValue> : IRepository<TKey, TValue>
        where TValue : IRepositoryItem<TKey>
    {
        private readonly ConcurrentDictionary<TKey, TValue> items;

        public InMemoryRepository()
        {
            this.items = new ConcurrentDictionary<TKey, TValue>();
        }

        public TValue this[TKey id] => 
            this.items.ContainsKey(id) ? this.items[id] : default(TValue);

        public void Add(TValue item)
        {
            this.items.GetOrAdd(item.Id, item);
        }

        public bool Remove(TKey id)
        {
            TValue removed = default(TValue);
            return this.items.TryRemove(id, out removed);
        }

        public bool Remove(TValue item)
        {
            return this.Remove(item.Id);
        }
    }

    public interface IRepository<TKey, TValue>
    {
        void Add(TValue item);
        bool Remove(TKey item);
        bool Remove(TValue id);
        TValue this[TKey id] { get; }
    }

    public interface IRepositoryItem<T>
    {
        T Id { get; set; }
    }
}