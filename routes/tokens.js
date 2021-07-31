const db = require('../connection');
const { nanoid } = require('nanoid');
const { createJwtToken } = require('../helper/jwt');

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
        if(!userid){
            return res.status(400).send({message:"userid is required in headers"});
        }
        const { redisClient } = db;
        const token = await redisClient.RANDOMKEY();
        if(!token) {
            return res.status(404).send({message:"No token found"});
        }
        await redisClient.del(token); // remove key once it is assigned to the client;
        const finalToken = createJwtToken({
            userid,
            assignedToken: token
        })
        return res.status(200).send({
            id: userid,
            token: finalToken
        });

    } catch (error) {
        throw new Error(error.message);
    }
}


module.exports = {
    generateToken,
    getToken
}