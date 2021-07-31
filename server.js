const express = require('express');
const app = express();
const routes = require('./routes');
const port = process.env.PORT || 4000;
require('./connection');

app.use(express.json());
app.use('/api',routes);

app.listen(port,() => {
    console.log(`================= sever running on port ${port} ======================`);
})

module.exports = app;