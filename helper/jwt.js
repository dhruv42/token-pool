const jwt = require('jsonwebtoken');
const { secretToken } = require('../config');

function createJwtToken(data) {
    // token consists of userid and uuid with timestamp, expires in 60s.
    return jwt.sign(data, secretToken, { expiresIn: 60 });
}

module.exports = {
    createJwtToken
}