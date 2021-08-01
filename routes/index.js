const router = require('express').Router();
const {getToken, generateToken, unblockToken, deleteToken, keepAlive} = require('./tokens');

router.get('/',(req,res) => {
    res.send({foo:"bar"});
})

router.get('/token', getToken);
router.post('/token', generateToken);
router.put('/token/unblock',unblockToken);
router.delete('/token',deleteToken);
router.put('/token/keep-alive',keepAlive)

module.exports = router;