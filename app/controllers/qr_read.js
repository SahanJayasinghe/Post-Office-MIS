const express = require('express');
const router = express.Router();
// const Address = require('../models/Address');
const Normal_Post = require('../models/Normal_Post');
const Registered_Post = require('../models/Registered_Post');
const Parcel_Post = require('../models/Parcel_Post')
const helper = require('../../core/helper');

router.post('/post-details', async (req, res) => {
    try {
        // body contains post type and post id {id: '15', type: 'RegPost'}
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let pattern = /^\d+$/;
        let id_check = req.body.hasOwnProperty('id') && pattern.test(req.body.id);
        let type_check = req.body.hasOwnProperty('type') && ['NormalPost', 'RegPost', 'Parcel'].includes(req.body.type);

        if((body_length == 2) && id_check && type_check){
            let result;
            let response_obj = {};

            if(req.body.type == 'NormalPost'){
                result = await Normal_Post.get_normal_posts(req.body.id);
                console.log(result);
                if(result.error){
                    res.status(400).send(result.error);
                }
                else{
                    response_obj = {receiver: result.output.address};
                }
            }

            else if(req.body.type == 'RegPost'){
                result = await Registered_Post.get_reg_post(req.body.id);
                console.log(result);
                if(result.error){
                    res.status(400).send(result.error);
                }
                else{
                    let status = helper.format_status(result.output.status);
                    console.log(status);                  
                    response_obj = {
                        receiver: result.output.receiver,
                        sender: result.output.sender,
                        speed_post: (result.output.speed_post == '1') ? true: false,
                        status: [result.output.status, status],
                        posted_on: result.output.posted_dt,
                        last_location: result.output.current_location,
                        last_update: result.output.last_update
                    };
                }
            }

            else{
                result = await Parcel_Post.get_parcel(req.body.id);
                console.log(result);
                if(result.error){
                    res.status(400).send(result.error);
                }
                else{
                    let status = helper.format_status(result.output.status);
                    response_obj = {
                        receiver: result.output.receiver,
                        status: [result.output.status, status],
                        posted_on: result.output.posted_dt,
                        posted_location: result.output.posted_location,
                        last_location: result.output.current_location,
                        last_update: result.output.last_update
                    };
                }
            }
            res.status(200).send(response_obj);
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
        // body contains {type: 'RegPost', id: '12', post_office: '10400'}
        // post office code can be extracted from the token. 
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let pattern = /^\d+$/;
        let id_check = req.body.hasOwnProperty('id') && pattern.test(req.body.id);
        let type_check = req.body.hasOwnProperty('type') && ['RegPost', 'Parcel'].includes(req.body.type);
        pattern = /^\d{5}$/;
        let code_check = req.body.hasOwnProperty('post_office') && pattern.test(req.body.post_office);

        if((body_length == 3) && type_check && id_check && code_check){
            let result;
            if(req.body.type == 'RegPost'){
                result = await Registered_Post.update_location(req.body.id, req.body.post_office);                
            }
            else{
                result = await Parcel_Post.update_location(req.body.id, req.body.post_office);
            }
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
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

module.exports = router;