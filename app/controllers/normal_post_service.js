const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Normal_Post = require('../models/Normal_Post');

router.post('/address', async (req, res) => {
    try {
        // body contains house number & postal area ex: {number:46, postal_area: Moratuwa,10400}
        console.log(req.body);      
        let result = await Address.get_address(req.body);
        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            let {id, number, street, sub_area, postal_area, postal_code} = result.output;
            let address_obj = {id, number, street, sub_area, postal_area, postal_code};
            res.status(200).send(address_obj);
        }        
    } 
    catch (err) {
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action'); 
    }
});

router.put('/', async (req, res) => {
    try {
        // delivery_address_id: 2, price: 16.50
        console.log(req.body);

        // generate QR code which consists delivery address, current date time
        const pattern = /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/;       // pattern of float with 2 decimal points
        let is_currency = pattern.test(req.body.price);
        if((req.body.price === '0' || is_currency) && (parseFloat(req.body.price) <= 1000)){
            let price = parseFloat(req.body.price);
            let result = await Normal_Post.create_normal_post(req.body.id, price);
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
    catch (err) {
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

module.exports = router;