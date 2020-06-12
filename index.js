const express = require('express');
const bcrypt = require('bcrypt');
const config = require('config');
const DB = require('./core/db');
const addresses = require('./app/controllers/addresses');
const normal_post_service = require('./app/controllers/normal_post_service');
const registered_post_service = require('./app/controllers/registered_post_service');
const qr_read = require('./app/controllers/qr_read');
const resident_det = require('./app/controllers/resident_details');
const admins = require('./app/controllers/admins');
const postal_areas = require('./app/controllers/postal_areas');
const post_offices  = require('./app/controllers/post_offices');
const parcel_post_service = require('./app/controllers/parcel_post_service');
const money_order_service = require('./app/controllers/money_order_service');

const app = express();

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR !!! : jwtPrivateKey is not defined.');
    process.exit(1);
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
    // console.log(__dirname);
    // Model.connect();
    DB.handleConnection();
}

app.use(express.json());   

app.use('/addresses', addresses);
app.use('/normal-post', normal_post_service);
app.use('/registered-post', registered_post_service);
app.use('/qr-read', qr_read);
app.use('/resident-details', resident_det);
app.use('/admins', admins);
app.use('/postal-areas', postal_areas);
app.use('/post-offices', post_offices);
app.use('/parcel-post', parcel_post_service );
app.use('/money-order', money_order_service);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => { console.log(`Listening on port ${port}`); });

module.exports = server;