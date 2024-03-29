const express = require('express');
const router = express.Router();
// const jwt = require('jsonwebtoken');
const Post_Office = require('../models/Post_Office');
const Postal_Area = require('../models/Postal_Area');
const auth_post_office = require('../../middleware/auth_post_office');
const auth_admin = require('../../middleware/auth_admin');

router.post('/login', async (req, res, next) => {
    try {
        // body contains postal code and password
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let key_check = (req.body.hasOwnProperty('code') && req.body.hasOwnProperty('password'));

        let code_check = false;
        if(req.body.hasOwnProperty('code')){
            let pattern = /^\d{5}$/;
            code_check = pattern.test(req.body.code);
        }
        let pw_check = false;
        if(req.body.hasOwnProperty('password')){
            let pw_length = req.body.password.trim().length;
            pw_check = pw_length > 0 && pw_length < 21;
        }

        if(key_check && (body_length == 2) && code_check && pw_check){
            let result = await Post_Office.login(req.body.code, req.body.password);
            console.log(result);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                // with expiration
                // jwt.sign({
                //     data: 'foobar'
                //   }, 'secret', { expiresIn: '7 days' });

                // let token_data = {
                //     user_type: 'post_office',
                //     user_id: result.output.code
                // }
                // // secret key should be retrieved from environment variable (need npm Config package)
                // const token = jwt.sign(token_data, 'SecretKey');
                // console.log(token);
                const token = Post_Office.generate_po_token(result.output.code);
                res.status(200).send({token: token, postal_area: result.output.name});
            }
        }
        else{
            res.status(400).send('Invalid details provided');
        }
    }
    catch (err) {
        console.log('/post-offices/login POST/ catch block');
        next(err);
    }
});

router.put('/', auth_admin, async (req, res, next) => {
    try {
        // body contains postal code and password
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let key_check = (req.body.hasOwnProperty('code') && req.body.hasOwnProperty('password'));
        let code_check = (req.body.hasOwnProperty('code') && /^\d{5}$/.test(req.body.code));

        // for any special char: ^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,20}$
        let pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&^_+\-=])[A-Za-z\d@$!%*#?&^_+\-=]{6,20}$/;
        let pw_check = req.body.hasOwnProperty('password') && pattern.test(req.body.password);

        if(key_check && (body_length == 2) && code_check && pw_check){
            let result = await Postal_Area.create_postal_account(req.body.code, req.body.password);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                res.status(200).send(`Postal account created for the post office ${req.body.code}`);
            }
        }
        else{
            let msg = '';
            msg += (!key_check || body_length != 2) ? 'Invalid data fields provided. ' : '';
            msg += (req.body.hasOwnProperty('code') && !code_check) ? 'Invalid Postal Code. ' : '';
            msg += (req.body.hasOwnProperty('password') && !pw_check) ? 'Password does not have the required strength. ' : '';
            res.status(400).send(msg);
        }
    }
    catch (err) {
        console.log('/post-offices PUT/ catch block');
        next(err);
    }
});

router.post('/reg-posts/:category', auth_post_office, async (req, res, next) => {
    try {
        // req.body contains post office code and status type
        console.log(req.body);
        console.log(req.post_office);
        let code_check = (req.body.hasOwnProperty('post_office') && /^\d{5}$/.test(req.body.post_office));
        let param_check = (['received', 'sent'].includes(req.params.category));
        let status_arr = ['on-route-receiver', 'receiver-unavailable', 'delivered',
            'on-route-sender', 'sender-unavailable', 'sent-back', 'failed'];
        let status_check = req.body.hasOwnProperty('status') && status_arr.includes(req.body.status);

        if (code_check && param_check && status_check){
            let result = await Post_Office.get_reg_posts_by_status(req.body.post_office, req.params.category, req.body.status);
            if(result.error){
                res.status(400).send(result.error);
            }
            else if(!result.output.length){
                res.status(200).send([]);
            }
            else{
                res.status(200).send(result.output);
            }
        }
        else{
            res.status(400).send('Invalid request parameters');
        }
    }
    catch (err) {
        console.log('/post-offices/reg-posts/:category POST/ catch block');
        next(err);
    }
});

router.post('/parcels/:category', auth_post_office, async (req, res, next) => {
    try {
        // req.body contains post office code and status type
        console.log(req.body);
        console.log(req.params);
        let code_check = (req.body.hasOwnProperty('post_office') && /^\d{5}$/.test(req.body.post_office));
        let param_check = (['received', 'sent'].includes(req.params.category));
        let status_arr = ['on-route-receiver', 'receiver-unavailable', 'delivered', 'failed'];
        let status_check = req.body.hasOwnProperty('status') && status_arr.includes(req.body.status);

        if (code_check && param_check && status_check){
            let result = await Post_Office.get_parcels_by_status(req.body.post_office, req.params.category, req.body.status);
            if(result.error){
                res.status(400).send(result.error);
            }
            else if(!result.output.length){
                res.status(200).send([]);
            }
            else{
                res.status(200).send(result.output);
            }
        }
        else{
            res.status(400).send('Invalid request parameters');
        }
    }
    catch (err) {
        console.log('/post-offices/parcels/:category POST/ catch block');
        next(err);
    }
});

router.post('/money-orders/:category', auth_post_office, async (req, res, next) => {
    try {
        // req.body contains post office code and status type
        console.log(req.body);
        console.log(req.params);
        let code_check = (req.body.hasOwnProperty('post_office') && /^\d{5}$/.test(req.body.post_office));
        let param_check = (['received', 'sent'].includes(req.params.category));
        let status_arr = ['created', 'delivered', 'returned'];
        let status_check = req.body.hasOwnProperty('status') && status_arr.includes(req.body.status);

        if (code_check && param_check && status_check) {
            let {post_office, status} = req.body;
            let result = await Post_Office.get_money_orders_by_status(post_office, req.params.category, status);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                res.status(200).send(result.output);
            }
        }
        else{
            res.status(400).send('Invalid request parameters');
        }
    }
    catch (err) {
        console.log('/post-offices/money-orders/:category catch block');
        next(err);
    }
});

router.post('/reg-posts/all-received', async (req, res) => {
    try {
        // req.body contains {post_office: '10400'}
        // or post office code can be extracted from token
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let pattern = /^\d{5}$/;
        let code_check = req.body.hasOwnProperty('post_office') && pattern.test(req.body.post_office);
        if(body_length == 1 && code_check){
            let result = await Post_Office.get_reg_posts(req.body.post_office, 'received');
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                res.status(200).send(result.output);
            }
        }
        else{
            res.status(400).send('Invalid details provided');
        }
    }
    catch (err) {
        console.log('Route handler catch block');
        console.log(err);
        res.status(500).send('Server could not perform the action');
    }
});

module.exports = router;