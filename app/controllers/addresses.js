const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const helper = require('../../core/helper');
const auth_admin = require('../../middleware/auth_admin');
const auth_post_office = require('../../middleware/auth_post_office');
// console.log(Address);

router.get('/:id', async (req, res) => {
    try{
        let id = req.params.id;
        let result = await Address.get_address_by_id(id);
        console.log(result);

        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
        }
    }
    
    catch(err){
        console.log('Route handler catch block');
        console.log(err);
        res.status(500).send('Server could not perform the action');
    }   
});

router.post('/confirm', auth_post_office, async (req, res, next) => {
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
        console.log('/addresses/confirm POST/ catch block');
        next(err);
        // console.log(err);
        // res.status(500).send('Server could not perform the action'); 
    }
});

router.post('/', auth_admin, async (req, res, next) => {
    try{
        // body contains {number: '121/B', street: 'Temple Rd.', sub_area: 'Rawathawatta', postal_code: '10400'}
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let address_check = helper.validate_address(req.body);
        
        if((body_length == 4) && address_check){
            let result = await Address.insert_address(req.body);
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
    catch(err){
        console.log('/addresses POST/ catch block');
        next(err);   
    }    
});

router.put('/:id', auth_admin, async (req, res, next) => {
    try{
        // body contains number, street, sub_area, postal_area
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let id_check = /^\d+$/.test(req.params.id);
        let address_check = helper.validate_address(req.body);

        if((body_length == 4) && id_check && address_check){        
            let address_obj = req.body;
            address_obj.id = req.params.id;
            let result = await Address.change_address(address_obj);
            console.log(result);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                res.status(200).send('Address record updated');
            }
        }
        else{
            res.status(400).send('Invalid details provided');
        }
    }
    catch(err){
        console.log('/addresses/:id PUT/ catch block');
        next(err);          
    }  
});

router.post('/area', auth_admin, async (req, res, next) => {
    try {
        // body contains {postal_code: 10400}
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let code_check = req.body.hasOwnProperty('postal_code') && /^\d{5}$/.test(req.body.postal_code);
        // if (req.body.hasOwnProperty('postal_area')){
        //     let pa_arr = req.body.postal_area.split(',');        
        //     code_check = (pa_arr.length == 2) && /^\d{5}$/.test(pa_arr[1]);
        // }

        if(body_length == 1 && code_check){
            let result = await Address.get_addresses_by_area(req.body.postal_code);
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
        console.log('/addresses/area POST/ catch block');
        next(err);
    }
});

module.exports = router;