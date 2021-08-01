const db = require('../connection');
const { nanoid } = require('nanoid');
const { calculateTimeStampDifference } = require('../helper/helper');

const generateToken = async (req, res) => {
    try {
        const { redisClient } = db;
        const token = nanoid() + '-' + new Date().getTime();
        await redisClient.set(token, "", "EX", 300) // expire in 5 mins.
        return res.status(201).send();
    } catch (error) {
        throw new Error(error.message);
    }
}

const getToken = async (req, res) => {
    try {
        const { userid } = req.headers;
        if (!userid) {
            return res.status(400).send({ message: "userid is required in headers" });
        }
        const { redisClient, mongo } = db;
        const exists = await mongo.collection('tokens').findOne({ _id: userid });

        /** check if the token is already assigned to the client, if it is, return */
        if (exists) {
            return res.status(200).send({
                id: userid,
                token: exists.token
            });
        }
        const token = await redisClient.RANDOMKEY();
        if (!token) {
            return res.status(404).send({ message: "No token found" });
        }
        await redisClient.del(token); // remove key from redis once it is assigned to the client;

        // add an entry in mongo to keep track of assigned tokens with TTL index of 60s.
        await mongo.collection('tokens').insertOne({
            "_id": userid,
            token,
            generationTime: new Date()
        })
        return res.status(200).send({
            id: userid,
            token
        });

    } catch (error) {
        throw new Error(error.message);
    }
}

const unblockToken = async (req, res) => {
    try {
        const token = req.headers["access-token"];
        if (!token) {
            return res.status(400).send({ message: "token is required in headers" });
        }
        const { redisClient, mongo } = db;
        const exists = await mongo.collection('tokens').findOne({ token: token });
        if (!exists) {
            return res.status(404).send({ message: "token not found" });
        }

        /**
         * if the difference between generation time and current time is less than 0, 
         * means token has already expired in redis, token is invalid.
         * 
         * if the difference is less than 60, we can unblock the token and put it in 
         * the pool to make it available for others with left ttl.
         */
        const difference = calculateTimeStampDifference(exists.token)
        if (difference < 0) {
            return res.status(400).send({ message: "Invalid token" });
        }
        if (difference < 60) {
            await mongo.collection('tokens').deleteOne({ token: token })
        }
        await redisClient.set(exists.token, "", "EX", 300 - difference)
        return res.status(201).send({
            message: "Token successfully unblocked"
        });
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

const deleteToken = async (req, res) => {
    try {
        const token = req.headers["access-token"];
        if (!token) {
            return res.status(400).send({ message: "token is required in headers" });
        }
        const { redisClient, mongo } = db;
        // delete token from mongo as well as redis.
        await Promise.all([
            mongo.collection('tokens').deleteOne({ token: token }),
            redisClient.del(token)
        ])
        return res.status(204).send({
            message: "Token successfully deleted"
        });
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

const keepAlive = async (req,res) => {
    try {
        const token = req.headers["access-token"];
        if (!token) {
            return res.status(400).send({ message: "token is required in headers" });
        }
        const { redisClient, mongo } = db;
        const exists = await mongo.collection('tokens').findOne({ token: token });
        if(!exists) {
            return res.status(400).send({ message: "Invalid token" });
        }

        const difference = calculateTimeStampDifference(exists.token)

        // if client hits within 1 min, remove old doc and insert new doc with new generation time.
        if (difference < 60) {
            await mongo.collection('tokens').deleteOne({ token: token });
            await mongo.collection('tokens').insertOne({
                "_id": exists.userid,
                token:exists.token,
                generationTime: new Date()
            });
        }
        return res.status(204).send();
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

module.exports = {
    generateToken,
    getToken,
    unblockToken,
    deleteToken,
    keepAlive
}