const redis = require('async-redis');
const { MongoClient } = require('mongodb');
const { redisConnection, mongoConnection } = require('./config');

class Database {
    constructor() {
        this.mongoClient = new MongoClient(mongoConnection,{useUnifiedTopology:true});
        this.redisClient = null;
        this.mongoInit();
        this.redisInit();
    }

    async mongoInit(){
        await this.mongoClient.connect();
        this.mongo = this.mongoClient.db(process.env.DB_NAME);
        console.log("===== mongo connected =====");
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