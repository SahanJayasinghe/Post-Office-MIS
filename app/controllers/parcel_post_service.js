const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Parcel_Post = require('../models/Parcel_Post');
const helper = require('../../core/helper');

router.post('/address', async (req, res) => {
    try {
        // body contains house number & postal area
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

router.post('/', async (req, res) => {
    try {
        // req.body contains 
        // receiver: {id: 4, name: xyz}
        // payment: 52.50, descript: 'e-bay order', post_office: 10400 
        console.log(req.body);

        let body_length = Object.keys(req.body).length;
        let receiver_check = ( req.body.hasOwnProperty('receiver') && helper.validate_id_name(req.body.receiver) );
        let payment_check = (req.body.hasOwnProperty('payment') && helper.validate_currency(req.body.payment));
        let descript_check = (req.body.hasOwnProperty('descript'));
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
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

module.exports = router;