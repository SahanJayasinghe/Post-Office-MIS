const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Parcel_Post = require('../models/Parcel_Post');
const helper = require('../../core/helper');
const auth_post_office = require('../../middleware/auth_post_office');

router.post('/address', auth_post_office, async (req, res) => {
    try {
        // body contains house number & postal code
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let body_check = helper.validate_number_postal_code(req.body);
        if((body_length == 2) && body_check){      
            let result = await Address.get_address_by_details(req.body);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                let address_arr = [result.output.id];
                address_arr = address_arr.concat(helper.get_address_array(result.output));
                
                res.status(200).send(address_arr);
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

router.post('/', auth_post_office, async (req, res) => {
    try {
        // req.body contains 
        // receiver: {id: 4, name: xyz}
        // payment: 52.50, descript: 'e-bay order', post_office: 10400 
        console.log(req.body);

        let body_length = Object.keys(req.body).length;
        let receiver_check = ( req.body.hasOwnProperty('receiver') && helper.validate_id_name(req.body.receiver) );
        let payment_check = (req.body.hasOwnProperty('payment') && helper.validate_currency(req.body.payment));
        let str_pattern = /^(?=.*[A-Za-z])[A-Za-z\d\-/()[\]{}:<>?|!@&#*^$_=+\\.,\s]{1,1024}$/;
        let descript_check = ( req.body.hasOwnProperty('descript') 
            && ( req.body.descript.trim() === '' || str_pattern.test(req.body.descript)) );
        let code_check = req.body.hasOwnProperty('post_office') && /^\d{5}$/.test(req.body.post_office);

        if((body_length == 4) && receiver_check && payment_check && descript_check && code_check){
            let {receiver, payment, descript, post_office} = req.body;
            let result = await Parcel_Post.create_parcel_post(receiver, payment, descript, post_office);
            console.log(result);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                res.status(200).send(`${result.output.insertId}`);
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

router.get('/:id', auth_post_office, async (req, res) => {
    try {
        console.log(req.params.id);
        let id_check = /^\d+$/.test(req.params.id);
        if( !id_check) {
            return res.status(400).send('Invalid id');
        }
        let result = await Parcel_Post.get_parcel(req.params.id);
        console.log(result);
        if(result.error){
            return res.status(400).send(result.error);
        }
        let status = helper.format_status(result.output.status);
        let response_obj = {
            receiver: result.output.receiver,
            status: [result.output.status, status],
            posted_on: result.output.posted_dt,
            posted_location: result.output.posted_location,
            last_location: result.output.current_location,
            last_update: result.output.last_update,
            attempts_receiver: result.output.delivery_attempts
        };
        res.status(200).send(response_obj);
    } 
    catch (err) {
        console.log('Route handler catch block');
        console.log(err);
        res.status(500).send('Server could not perform the action');
    }
});

router.put('/location-update', auth_post_office, async (req, res) => {
    try {
        // body contains {id: '12', post_office: '10400'}
        // post office code can be extracted from the token. 
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let id_check = req.body.hasOwnProperty('id') && /^\d+$/.test(req.body.id);
        let code_check = req.body.hasOwnProperty('post_office') && /^\d{5}$/.test(req.body.post_office);

        if((body_length == 2) && id_check && code_check) {
            let result = await Parcel_Post.update_location(req.body.id, req.body.post_office);
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

router.put('/discard', auth_post_office, async (req, res) => {
    try {
        //body contains address_id and post_office
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let id_check = req.body.hasOwnProperty('id') && /^\d+$/.test(req.body.id);
        let code_check = req.body.hasOwnProperty('post_office') && /^\d{5}$/.test(req.body.post_office);

        if(body_length === 2 && id_check && code_check){
            let result = await Parcel_Post.discard_parcel(req.body.id, req.body.post_office);
            console.log(result);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                let status_arr = [result.output.status, helper.format_status(result.output.status)];
                res.status(200).send({status: status_arr, last_update: result.output.last_update});
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