const router = require('express').Router();
const { getToken, generateToken, unblockToken, deleteToken, keepAlive } = require('./tokens');
const { checkToken } = require('../middleware/validateRequest');

router.get('/', (req, res) => {
    res.send({ foo: "bar" });
})

router.get('/token', getToken);
router.post('/token', generateToken);
router.put('/token/unblock',checkToken ,unblockToken);
router.delete('/token', checkToken ,deleteToken);
router.put('/token/keep-alive',checkToken ,keepAlive)

module.exports = router;