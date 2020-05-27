const express = require('express');
const bcrypt = require('bcrypt');
// var mysql = require('mysql');
// const Model = require('./core/Model');
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

const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, x-auth-token, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

let dt = new Date();
console.log(`Current timestamp: ${dt.getTime()}`);
console.log(`Current date: ${dt.toLocaleDateString()}`);
console.log(`Current time: ${dt.toTimeString()}`);

bcrypt.hash('Moratuwa@123', 10).then(function(hash) {
    // Store hash in your password DB.
    console.log(hash);
});

// console.log(`Current timestamp 2: ${new Date().getTime()}`);

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`app: ${app.get('env')}`);
// console.log(__dirname);
// Model.connect();
DB.handleConnection();

app.use(express.json());
// const router = express.Router();
// app.use('/users/', router);
// db_obj = new DB();
// console.log(DB);
// console.log(select);
// DB.connect();    

app.use('/addresses', addresses);
app.use('/normal-post', normal_post_service);
app.use('/registered-post', registered_post_service);
app.use('/qr-read', qr_read);
app.use('/resident-details', resident_det);
app.use('/admins', admins);
app.use('/postal-areas', postal_areas);
app.use('/post-offices', post_offices);
app.use('/parcel-post', parcel_post_service );

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});