const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Normal_Post = require('../models/Normal_Post');
const helper = require('../../core/helper');

router.post('/address', async (req, res) => {
    try {
        // body contains house number & postal area ex: {number:46, postal_area: Moratuwa,10400}
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let body_check = helper.validate_number_postal_area(req.body);
        if((body_length == 2) && body_check){
            let result = await Address.get_address_by_details(req.body);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                let address_arr = [result.output.id];
                address_arr = address_arr.concat(helper.get_address_array(result.output)); 
                // let {id, number, street, sub_area, postal_area, postal_code} = result.output;
                // // let address_obj = {id, number, street, sub_area, postal_area, postal_code};
                // let address_arr = [id, number];
                // if(street != null){
                //     address_arr.push(street);
                // }
                // if(sub_area != null){
                //     address_arr.push(sub_area);
                // }
                // address_arr.push(postal_area);
                // address_arr.push(postal_code);

                res.status(200).send(address_arr);
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

router.put('/', async (req, res) => {
    try {
        // id: 2, price: 16.50
        console.log(req.body);
        let price_check = helper.validate_currency(req.body.price);
        if(price_check && (parseFloat(req.body.price) <= 1000)){
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