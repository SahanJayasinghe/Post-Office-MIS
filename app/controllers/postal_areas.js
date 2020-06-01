const express = require('express');
const router = express.Router();
const Postal_Area = require('../models/Postal_Area');

router.get('/', async (req, res) => {
    try {
        let result = await Postal_Area.get_all_postal_areas();
        console.log(result);

        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
        }
    }
    catch (err) {
        console.log('Route handler catch block');
        console.log(err);
        res.status(500).send('Server could not perform the action');
    }
});

router.get('/no-account', async (req, res) => {
    try {
        let result = await Postal_Area.postal_areas_without_account();
        console.log(result);

        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
        }
    }
    catch (err) {
        console.log('Route handler catch block');
        console.log(err);
        res.status(500).send('Server could not perform the action');
    }
});

router.get('/with-account', async (req, res) => {
    try {
        let result = await Postal_Area.postal_areas_with_account();
        console.log(result);

        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
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
        // req.body contains postal area name and code
        // ex: {code: '10400', name: 'Moratuwa'}
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let code_check = req.body.hasOwnProperty('code') && /^\d{5}$/.test(req.body.code);
        let name_check = req.body.hasOwnProperty('name') && /^[a-zA-Z][a-zA-Z0-9.\-\s]{0,19}$/.test(req.body.name);
        
        if ((body_length == 2) && code_check && name_check){
            let result = await Postal_Area.insert_postal_area(req.body);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                // if insert succeed, result.output = postal area object (req.body)
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

router.post('/province', async (req, res) => {
    try {
        // body contains {province: '1'}  digit of 1-9
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let prov_check = req.body.hasOwnProperty('province') && /^[1-9]{1}$/.test(req.body.province);
        if(body_length == 1 && prov_check){
            let result = await Postal_Area.get_postal_areas_by_province(req.body.province);
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

router.put('/', async(req, res) => {
    try {
        // body contains {code, name, prev_code}
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let code_check = req.body.hasOwnProperty('code') && /^\d{5}$/.test(req.body.code);
        let name_check = req.body.hasOwnProperty('name') && /^[a-zA-Z][a-zA-Z0-9.\-\s]{0,19}$/.test(req.body.name);
        let prev_code_check = req.body.hasOwnProperty('prev_code') && /^\d{5}$/.test(req.body.prev_code);

        if((body_length == 3) && code_check && name_check && prev_code_check){
            let {code, name, prev_code} = req.body;
            let result = await Postal_Area.update_postal_area(code, name, prev_code);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                res.status(200).send('Postal Area Updated');
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

router.post('/account', async (req, res) => {
    try {
        // body contains {postal_area: 'moratuwa,10400'}
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let code_check = false;
        if (req.body.hasOwnProperty('postal_area')){
            let pa_arr = req.body.postal_area.split(',');        
            code_check = (pa_arr.length == 2) && /^\d{5}$/.test(pa_arr[1]);
        }

        if((body_length == 1) && code_check){
            let result = await Postal_Area.get_postal_area(req.body.postal_area.split(',')[1]);
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