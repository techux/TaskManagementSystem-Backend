const redis = require("redis");
const dotenv = require('dotenv');
dotenv.config();

const client = redis.createClient({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
});

client.on("connect", ()=> {
    console.log("[INFO] Connected to Redis");
})
client.on("error", (err) => {
    console.error("[ERROR] Redis Error:", err)
});

client.connect(); 

const getCache = async (key) => {   
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error("[Error] get error in cache:", err);
        return null;
    }
};

const setCache = async (key, value, ttl = null) => {
    try {
        ttl = ttl || Number(process.env.REDIS_CACHE_TIME) || 600; 
        await client.setEx(key, ttl, JSON.stringify(value));
    } catch (err) {
        console.error("[ERROR] set error in cache:", err);
    }
};

const delCache = async (pattern) => {
    try {
        const keys = [];
        for await (const key of client.scanIterator({ MATCH: pattern })) {
            keys.push(key);
        }
        if (keys.length > 0) {
            await client.del(keys);
        }
    } catch (err) {
        console.error("[ERROR] Redis Delete Error:", err);
    }
};


module.exports = {
    getCache,
    setCache,
    delCache
};
