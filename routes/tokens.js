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
        await redisClient.del(token); // remove key once it is assigned to the client;
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

module.exports = {
    generateToken,
    getToken,
    unblockToken,
    deleteToken
}