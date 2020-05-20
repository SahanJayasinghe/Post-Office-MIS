const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Registered_Post = require('../models/Registered_Post');
const helper = require('../../core/helper');

router.post('/address', async (req, res) => {
    try {
        //req.body contains {receiver, sender}
        // receiver = {number: 46, postal_area: kal-eliya,11160}
        // sender = {number: 121/B, postal_area: moratuwa,10400}
        let body_length = Object.keys(req.body).length;
        let receiver_check = req.body.hasOwnProperty('receiver') && helper.validate_number_postal_area(req.body.receiver);
        let sender_check = req.body.hasOwnProperty('sender') && helper.validate_number_postal_area(req.body.sender);
        
        if((body_length == 2) && receiver_check && sender_check){

            let num_eq = (req.body.receiver.number == req.body.sender.number);
            let pa_eq = (req.body.receiver.postal_area == req.body.sender.postal_area);

            if(num_eq && pa_eq){
                res.status(400).send('Sender and Receiver can not be the same');
            }

            else{
                let receiver = await Address.get_address_by_details(req.body.receiver);
                let sender = await Address.get_address_by_details(req.body.sender);
                if(receiver.error && sender.error){
                    res.status(400).send('Could not find a receiver and a sender for the given details');
                }
                else if(receiver.error){
                    res.status(400).send('Could not find a receiver for the given details');
                }
                else if(sender.error){
                    res.status(400).send('Could not find a sender for the given details');
                }
                else{
                    // delete receiver.output.resident_key;
                    // delete sender.output.resident_key;
                    let receiver_arr = [receiver.output.id];
                    receiver_arr = receiver_arr.concat(helper.get_address_array(receiver.output));

                    let sender_arr = [sender.output.id];
                    sender_arr = sender_arr.concat(helper.get_address_array(sender.output));

                    res.status(200).send({receiver: receiver_arr, sender: sender_arr});
                }
            }
        }
        else{
            res.status(400).send('Invalid details provided');
        }
    } 
    catch (err) {
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

router.post('/', async (req, res) => {
    try {
        // req.body contains 
        // sender = {id: 2, name: abc}
        // receiver = {id: 4, name: xyz}
        // price: 52.50, speed_post: 0, post_office: '10400'
        console.log(req.body);
        
        let body_length_check = (Object.keys(req.body).length == 5);
        let receiver_check = ( req.body.hasOwnProperty('receiver') && helper.validate_id_name(req.body.receiver) );
        let sender_check = ( req.body.hasOwnProperty('sender') && helper.validate_id_name(req.body.sender) );
        let speed_post_check = req.body.hasOwnProperty('speed_post') && [true, false].includes(req.body.speed_post);
        console.log(speed_post_check);
        let code_check = req.body.hasOwnProperty('post_office') && /^\d{5}$/.test(req.body.post_office);        
        let price_check = helper.validate_currency(req.body.price);

        if(body_length_check && receiver_check && sender_check && speed_post_check && code_check && price_check){
            let {sender, receiver, price, speed_post, post_office} = req.body;
            // let postal_code = req.body.post_office;    // should be the code of the post office the letter is posted
            let result = await Registered_Post.create_reg_post(sender, receiver, price, speed_post, post_office);
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
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

router.put('/:id', async (req, res) => {
    try {
        let result = await Registered_Post.send_back(req.params.id);
        console.log(result);
        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
        }
    }
    catch (err) {
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

router.get('/:id', async (req, res) => {
    try {
        console.log(typeof req.params.id);
        let result = await Registered_Post.get_reg_post(req.params.id);
        console.log(result);
        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
        }
    } 
    catch (err) {
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

module.exports = router;