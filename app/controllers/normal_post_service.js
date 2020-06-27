const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Normal_Post = require('../models/Normal_Post');
const helper = require('../../core/helper');
const auth_post_office = require('../../middleware/auth_post_office');

router.post('/address', auth_post_office, async (req, res) => {
    try {
        // body contains house number & postal area ex: {number:46, postal_code: 10400}
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

router.put('/', auth_post_office, async (req, res) => {
    try {
        // id: 2, price: 16.50
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let id_check = req.body.hasOwnProperty('id') && /^\d+$/.test(req.body.id);
        
        if (body_length === 2 && id_check && req.body.hasOwnProperty('price')){
            let price_check = helper.validate_currency(req.body.price);
            if(price_check && (parseFloat(req.body.price) <= 1000)){
                let price = parseFloat(req.body.price);
                let result = await Normal_Post.create_normal_post(req.body.id, price);
                console.log(result);
                if(result.error){
                    res.status(400).send(result.error);
                }
                else{
                    res.status(200).send(result.output);
                }
            }
            else{
                res.status(400).send('Invalid letter price');
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

        let result = await Normal_Post.get_normal_posts(req.params.id);
        console.log(result);
        if(result.error){
            return res.status(400).send(result.error);
        }
        delete result.output.address_id; 
        delete result.output.total_price;
        res.status(200).send(result.output);
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
            let result = await Normal_Post.cancel_delivery(req.body.id, req.body.post_office);
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