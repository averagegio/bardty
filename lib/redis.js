import { Redis } from "@upstash/redis";

// Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env
// Falls back to an in-memory store for local development if env is missing
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisImpl;

if (url && token) {
  redisImpl = Redis.fromEnv();
} else {
  const hashStore = new Map();
  const listStore = new Map();

  redisImpl = {
    async hgetall(key) {
      const v = hashStore.get(key);
      return v || null;
    },
    async hset(key, obj) {
      const curr = hashStore.get(key) || {};
      hashStore.set(key, { ...curr, ...obj });
      return 1;
    },
    async exists(key) {
      return hashStore.has(key) ? 1 : 0;
    },
    async rpush(key, value) {
      const arr = listStore.get(key) || [];
      arr.push(value);
      listStore.set(key, arr);
      return arr.length;
    },
    async lrange(key, start, end) {
      const arr = listStore.get(key) || [];
      const len = arr.length;
      const s = start < 0 ? Math.max(0, len + start) : start;
      let e = end < 0 ? len + end : end;
      if (e >= len) e = len - 1;
      if (s > e || len === 0) return [];
      return arr.slice(s, e + 1);
    },
    async ltrim(key, start, end) {
      const arr = listStore.get(key) || [];
      const len = arr.length;
      const s = start < 0 ? Math.max(0, len + start) : start;
      let e = end < 0 ? len + end : end;
      if (e >= len) e = len - 1;
      const trimmed = s <= e ? arr.slice(s, e + 1) : [];
      listStore.set(key, trimmed);
      return "OK";
    },
  };
}

export const redis = redisImpl;


