const express = require('express');
const bcrypt = require('bcrypt');
const config = require('config');
const helmet = require('helmet');
const compression = require('compression');
const https = require('https');
const fs = require('fs');
const DB = require('./core/db');
require('./core/logger');

const app = express();
app.use(helmet());
app.use(compression());
require('./core/routes')(app);

if (!config.get('jwtPrivateKey')) {
    throw new Error('FATAL ERROR !!! : jwtPrivateKey is not defined.');
    // process.exit(1);
}

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, x-auth-token, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

if(process.env.NODE_ENV !== 'test'){
    let dt = new Date();
    console.log(`Current timestamp: ${dt.getTime()}`);
    console.log(`Current date: ${dt.toLocaleDateString()}`);
    console.log(`Current time: ${dt.toTimeString()}`);

    // bcrypt.hash('Moratuwa@123', 10).then(function(hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });

    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`app env: ${app.get('env')}`);
    // console.log(`root directory: ${__dirname}`);
    DB.handleConnection();
}

const options = {
    key: fs.readFileSync('bin/key.pem'),
    cert: fs.readFileSync('bin/cert.pem')
};
const port = process.env.PORT || 5000;
const server = app.listen(port, () => { console.log(`Listening on port ${port}`); });
// const secureServer = https.createServer(options, app);
// secureServer.listen(port, () => { console.log(`Listening on port ${port}`); })
module.exports = server;