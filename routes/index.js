const router = require('express').Router();
const {getToken, generateToken} = require('./tokens');

router.get('/',(req,res) => {
    res.send({foo:"bar"});
})

router.get('/token', getToken);
router.post('/token', generateToken);

module.exports = router;