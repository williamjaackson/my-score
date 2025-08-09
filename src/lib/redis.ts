import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL as string); // e.g. redis://default:password@host:port
export default redis;