const { Redis } = require("ioredis");

const redisClient = () => {
  if (process.env.REDIS_URI) {
    console.log("Redis connected.");
    return process.env.REDIS_URI;
  }
  throw new Error("Redis connection failed.");
};

const redis = new Redis(redisClient());

module.exports = redis;
