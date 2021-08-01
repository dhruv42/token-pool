const router = require('express').Router();
const {getToken, generateToken, unblockToken, deleteToken} = require('./tokens');

router.get('/',(req,res) => {
    res.send({foo:"bar"});
})

router.get('/token', getToken);
router.post('/token', generateToken);
router.put('/token/unblock',unblockToken);
router.delete('/token',deleteToken);

module.exports = router;