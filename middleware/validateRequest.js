function checkToken(req, res, next) {
    if(!req.headers["access-token"]){
        return res.status(400).send({message:"Token required in headers"});
    }
    next();
}

module.exports = {
    checkToken
}