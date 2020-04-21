const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Normal_Post = require('../models/Normal_Post');

router.post('/', async (req, res) => {
    try {
        // body contains house number & postal area ex: {number:46, postal_area: Moratuwa,10400}
        console.log(req.body);      
        let result = await Address.get_address(req.body);
        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
        }        
    } 
    catch (err) {
        console.log('async function error: ' + err.message);
    }
});

router.put('/', async (req, res) => {
    try {
        // delivery_address_id: id
        console.log(req.body);

        // generate QR code which consists delivery address, current date time
        let result = await Normal_Post.create_normal_post(req.body.id);
        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
        }
    } 
    catch (err) {
        console.log('async function error: ' + err.message);
    }
});

module.exports = router;