const express = require('express');
// var mysql = require('mysql');
const Model = require('./core/Model');
// const DB = require('./core/db');
const addresses = require('./app/controllers/addresses');
const normal_post_service = require('./app/controllers/normal_post_service');
const app = express();

let dt = new Date();
console.log(`Current timestamp: ${dt.getTime()}`);
console.log(`Current date: ${dt.toLocaleDateString()}`);
console.log(`Current time: ${dt.toTimeString()}`);

// console.log(`Current timestamp 2: ${new Date().getTime()}`);

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`app: ${app.get('env')}`);
// console.log(__dirname);
Model.connect();

app.use(express.json());
// const router = express.Router();
// app.use('/users/', router);
// db_obj = new DB();
// console.log(DB);
// console.log(select);
// DB.connect();    

app.use('/addresses', addresses);
app.use('/normal-post', normal_post_service);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});