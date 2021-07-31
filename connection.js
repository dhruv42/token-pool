const redis = require('async-redis');
const { redisConnection } = require('./config');

class Database {
    constructor() {
        this.redisClient = null;
        this.redisInit();
    }

    async redisInit() {
        this.redisClient = redis.createClient({
            host: redisConnection.host,
            port: redisConnection.port
        })
        console.log("======== redis connected =======");
    }
}

module.exports = new Database();