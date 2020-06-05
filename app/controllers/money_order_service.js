const express = require('express');
const router = express.Router();
const Money_Order = require('../models/Money_Order');
const helper = require('../../core/helper');
const auth_post_office = require('../../middleware/auth_post_office');

router.post('/', auth_post_office, async (req, res) => {
    try {
        // body contains {sender_name, receiver_name, receiver_postal_code, amount, price, posted_location}
        console.log(req.body);
        let body_check = helper.validate_money_order(req.body);
        if(body_check){
            let result = await Money_Order.create_money_order(req.body);
            console.log(result);
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

router.post('/verify/:customer', auth_post_office, async (req, res) => {
    try {
        // body = {sender_name, receiver_name, id, secret_key, post_office}
        console.log(req.body);
        // process = 'deliver' | 'return'
        console.log(req.params);
        if ( !['receiver', 'sender'].includes(req.params.customer) ){
            return res.status(404).send('invalid url');
        }

        let body_length = Object.keys(req.body).length;
        let id_check = req.body.hasOwnProperty('id') && /^\d+$/.test(req.body.id);
        // if (!req.body.hasOwnProperty('posted_date') || !req.body.hasOwnProperty('posted_time')) {
        //     return res.status(400).send('Posted date and time fields are required');
        // }
        // let dt_check = helper.validate_datetime(req.body.posted_date, req.body.posted_time);
        // console.log(dt_check);
        // if (!dt_check[0]) {
        //     return res.status(400).send(dt_check[1]);
        // }

        let name_pattern = /^(?=.*[A-Za-z])[A-Za-z\-,.\s]{1,50}$/;
        let sender_check = req.body.hasOwnProperty('sender_name') && name_pattern.test(req.body.sender_name);
        let receiver_check = req.body.hasOwnProperty('receiver_name') && name_pattern.test(req.body.receiver_name);
        
        let secret_key_check = req.body.hasOwnProperty('secret_key') && req.body.secret_key.trim() !== '';
        secret_key_check = secret_key_check && req.body.secret_key.length < 21;
        let po_check = req.body.hasOwnProperty('post_office') && /^\d{5}$/.test(req.body.post_office);

        if (body_length === 5 && sender_check && receiver_check && id_check && secret_key_check && po_check) {
            let result = await Money_Order.verify_money_order(req.body, req.params.customer);
            console.log(result);
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

router.put('/:process', auth_post_office, async (req, res) => {
    try {
        // body = {id, secret_key, post_office}
        console.log(req.body);
        // process = 'deliver' | 'return'
        console.log(req.params);
        if ( !['deliver', 'return'].includes(req.params.process) ){
            return res.status(400).send('invalid url');
        }

        let body_length = Object.keys(req.body).length;
        let id_check = req.body.hasOwnProperty('id') && /^\d+$/.test(req.body.id);
        let secret_key_check = req.body.hasOwnProperty('secret_key') && req.body.secret_key.trim() !== '';
        secret_key_check = secret_key_check && req.body.secret_key.length < 21;
        let po_check = req.body.hasOwnProperty('post_office') && /^\d{5}$/.test(req.body.post_office);

        if(body_length === 3 && id_check && secret_key_check && po_check) {
            let {id, secret_key, post_office} = req.body;
            let result;
            (req.params.process === 'deliver')
            ? result = await Money_Order.deliver_money_order(id, secret_key, post_office)
            : result = await Money_Order.return_money_order(id, secret_key, post_office);
            
            console.log(result);
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