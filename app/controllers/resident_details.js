const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Registered_Post = require('../models/Registered_Post');
const Parcel_Post = require('../models/Parcel_Post');
const Normal_Post = require('../models/Normal_Post');
const helper = require('../../core/helper');

router.post('/address', async (req, res) => {
    try {
        // body contains number, postal_area, resident_key
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let number_pa_check = helper.validate_number_postal_area(req.body);
        let resident_key_check = false;
        if(req.body.hasOwnProperty('resident_key')){
            let resident_key_length = req.body.resident_key.trim().length;
            resident_key_check = (resident_key_length > 0) && (resident_key_length < 21);
        }

        if (body_length == 3 && number_pa_check && resident_key_check){
            let input_obj = {number: req.body.number, postal_area: req.body.postal_area};
            let result = await Address.get_address_by_details(input_obj);
            if(result.error){
                return res.status(400).send(result.error);
            }
            
            if(result.output.resident_key !== req.body.resident_key){
                return res.status(400).send('Invalid Access Credentials Provided.');
            }
            let address_arr = [result.output.id].concat(helper.get_address_array(result.output));
            res.status(200).send(address_arr);   
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

router.post('/reg-posts/:category', async (req, res) => {
    try {
        // req.body contains resident id (address id), status type and resident_key
        // ex: {resident_id: '2', status: 'delivering', resident_key: '***'}
        console.log(req.body);

        let body_length = Object.keys(req.body).length;
        let id_check = req.body.hasOwnProperty('resident_id') && /^\d+$/.test(req.body.resident_id);
        let param_check = (['received', 'sent'].includes(req.params.category))
        let status_arr = ['delivering', 'delivered', 'returning', 'sent-back', 'failed'];
        let status_check = req.body.hasOwnProperty('status') && status_arr.includes(req.body.status);
        let resident_key_check = helper.validate_resident_key(req.body);

        if(body_length == 3 && id_check && param_check && status_check && resident_key_check){            
            let {resident_id, status, resident_key} = req.body;
            let resident_key_result = await Address.get_resident_key(resident_id);
            if (resident_key_result.error){
                return res.status(400).send(resident_key_result.error);
            }

            if(resident_key_result.output !== resident_key){
                return res.status(400).send('Authorization failed');
            }

            let result = await Registered_Post.get_resident_reg_posts_by_status(resident_id, req.params.category, status);
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

router.post('/parcels', async (req, res) => {
    try {
        // body contains resident_id, status and resident_key
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let id_check = req.body.hasOwnProperty('resident_id') && /^\d+$/.test(req.body.resident_id);
        let status_arr = ['delivering', 'delivered', 'failed'];
        let status_check = req.body.hasOwnProperty('status') && status_arr.includes(req.body.status);
        let resident_key_check = helper.validate_resident_key(req.body);

        if(body_length == 3 && id_check && status_check && resident_key_check){
            let {resident_id, status, resident_key} = req.body;
            let resident_key_result = await Address.get_resident_key(resident_id);
            if (resident_key_result.error){
                return res.status(400).send(resident_key_result.error);
            }

            if(resident_key_result.output !== resident_key){
                return res.status(400).send('Authorization failed');
            }

            let result = await Parcel_Post.get_resident_parcels_by_status(resident_id, status);
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

router.post('/normal-posts',async (req, res) => {
    try {
        // body contains resident_id and resident_key
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let id_check = req.body.hasOwnProperty('resident_id') && /^\d+$/.test(req.body.resident_id);
        let resident_key_check = helper.validate_resident_key(req.body);

        if(body_length == 2 && id_check && resident_key_check){
            let {resident_id, resident_key} = req.body;
            let resident_key_result = await Address.get_resident_key(resident_id);
            if (resident_key_result.error){
                return res.status(400).send(resident_key_result.error);
            }

            if(resident_key_result.output !== resident_key){
                return res.status(400).send('Authorization failed');
            }
            
            let result = await Normal_Post.get_resident_normal_posts(resident_id);
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

router.post('/', async (req, res) => {    
    try {
        // req.body contains resident key embedded with address id ex: QM312U0Z 
        // key is the first 3 and the last 3 characters. in between is the id. ex: key=QM3U0Z id=12
        let address_id = req.body.key.slice(3, -3);
        let key = req.body.key.slice(0,3) + req.body.key.slice(-3);
        console.log(key);

        let address_result = await Address.get_address_by_id(address_id);
        
        if(address_result.error){
            res.status(400).send('Invalid key provided. Could not find an address.');
        }
        else if(address_result.output.resident_key != key){
            res.status(400).send('Invalid key provided. Could not find an address.');
        }
        else{
            let received_reg_posts = await Registered_Post.get_receiver_reg_posts(address_id);
            let sent_reg_posts = await Registered_Post.get_sender_reg_posts(address_id);
            let normal_post_details = await Normal_Post.get_normal_posts(address_id);

            if(received_reg_posts.error || sent_reg_posts.error || normal_post_details.error){
                res.status(400).send('An error occured while retreiving letter details');
            }
            else{
                let address_obj = address_result.output;
                let address = `${address_obj.number}, ${address_obj.street}, ${address_obj.sub_area}, 
                    ${address_obj.postal_area}, ${address_obj.postal_code}`;
                let result_obj = {
                    address: address,
                    received_reg_posts: received_reg_posts.output,
                    sent_reg_posts: sent_reg_posts.output,
                    normal_post_details: normal_post_details.output
                }
                res.status(200).send(result_obj);
            }
        }
    }
    catch(err) {
        console.log('Route handler catch block');
        res.status(500).send('Server could not perform the action');
    }
});

module.exports = router;