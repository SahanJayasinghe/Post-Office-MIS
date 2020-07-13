const express = require('express');
const addresses = require('../app/controllers/addresses');
const normal_post_service = require('../app/controllers/normal_post_service');
const registered_post_service = require('../app/controllers/registered_post_service');
// const qr_read = require('../app/controllers/qr_read');
const resident_det = require('../app/controllers/resident_details');
const admins = require('../app/controllers/admins');
const postal_areas = require('../app/controllers/postal_areas');
const post_offices  = require('../app/controllers/post_offices');
const parcel_post_service = require('../app/controllers/parcel_post_service');
const money_order_service = require('../app/controllers/money_order_service');
const error_handler = require('../middleware/error_handler');

module.exports = function(app) {
    app.use(express.json());   

    app.use('/addresses', addresses);
    app.use('/normal-post', normal_post_service);
    app.use('/registered-post', registered_post_service);
    // app.use('/qr-read', qr_read);
    app.use('/resident-details', resident_det);
    app.use('/admins', admins);
    app.use('/postal-areas', postal_areas);
    app.use('/post-offices', post_offices);
    app.use('/parcel-post', parcel_post_service );
    app.use('/money-order', money_order_service);
    app.use(error_handler);
}