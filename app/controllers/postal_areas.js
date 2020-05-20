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
        console.log('promise reject: ' + err.query_error);
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
        console.log('promise reject: ' + err.query_error);
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
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

router.post('/', async (req, res) => {
    try {
        // req.body contains postal area name and code
        // ex: {code: '10400', name: 'Moratuwa'}
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let key_check = (req.body.hasOwnProperty('code') && req.body.hasOwnProperty('name'));
        
        let code_check = false;
        if(req.body.hasOwnProperty('code')){
            let pattern = /^\d{5}$/;
            code_check = pattern.test(req.body.code);
        }

        let name_check = false;
        if(req.body.hasOwnProperty('name')){
            let pattern = /^[a-zA-Z-\s]{1,20}$/;
            name_check = pattern.test(req.body.name);
        }
        if (!req.body.name.replace(/\s/g, '').length) {
            name_check = false;    
        }

        if (key_check && (body_length == 2) && code_check && name_check){
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
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

module.exports = router;