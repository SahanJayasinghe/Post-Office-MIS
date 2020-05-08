const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Registered_Post = require('../models/Registered_Post');

router.post('/address', async (req, res) => {
    try {
        //req.body contains {receiver, sender}
        // receiver = {number: 46, postal_area: kal-eliya,11160}
        // sender = {number: 121/B, postal_area: moratuwa,10400}
        
        let num_eq = (req.body.receiver.number == req.body.sender.number);
        let pa_eq = (req.body.receiver.postal_area == req.body.sender.postal_area);

        if(num_eq && pa_eq){
            res.status(400).send('Sender and Receiver can not be the same');
        }

        else{
            let receiver = await Address.get_address(req.body.receiver);
            let sender = await Address.get_address(req.body.sender);
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
                delete receiver.output.resident_key;
                delete sender.output.resident_key;
                res.status(200).send({receiver: receiver.output, sender: sender.output});
            }
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
        // price: 52.50, speed_post: 0

        console.log(req.body);
        let {sender, receiver, price, speed_post} = req.body;
        let postal_code = '20400';    // should be the code of the post office the letter is posted
        let result = await Registered_Post.create_reg_post(sender, receiver, price, speed_post, postal_code);
        console.log(result);
        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(`${result.output.insertId}`);
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