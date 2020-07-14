const express = require('express');
const bcrypt = require('bcrypt');
const config = require('config');
const helmet = require('helmet');
const compression = require('compression');
const https = require('https');
const fs = require('fs');
require('./core/logger');
const DB = require('./core/db');
const cors = require('./middleware/cors');

const app = express();
app.use(helmet());
app.use(compression());

if (!config.get('jwtPrivateKey')) {
    throw new Error('FATAL ERROR !!! : jwtPrivateKey is not defined.');
    // process.exit(1);
}

app.use(cors);

if(process.env.NODE_ENV !== 'test'){
    let dt = new Date();
    // console.log(`Current timestamp: ${dt.getTime()}`);
    console.log(`Current date & time: ${dt.toLocaleDateString()} ${dt.toTimeString()}`);

    // bcrypt.hash('Moratuwa@123', 10).then(function(hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });

    console.log(`NODE_ENV: ${process.env.NODE_ENV} | app env: ${app.get('env')}`);
    // console.log(`root directory: ${__dirname}`);
    DB.handleConnection();
}

require('./core/routes')(app);

const options = {
    key: fs.readFileSync('bin/key.pem'),
    cert: fs.readFileSync('bin/cert.pem')
};
const port = process.env.PORT || 5000;
const server = app.listen(port, () => { console.log(`Listening on port ${port}`); });
// const secureServer = https.createServer(options, app);
// secureServer.listen(port, () => { console.log(`Listening on port ${port}`); })
module.exports = server;