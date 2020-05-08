const express = require('express');
const router = express.Router();
const Post_Office = require('../models/Post_Office');

router.post('/received', async (req, res) => {
    try {
        // req.body contains post office code and status type
        console.log(req.body);
        status_arr = ['on-route-receiver', 'receiver-unavailable', 'delivered', 
            'on-route-sender', 'sender-unavailable', 'sent-back', 'failed'];

        if (status_arr.includes(req.body.status)){
            let result = await Post_Office.get_reg_posts(req.body.post_office, 'received', req.body.status);
            if(result.error){
                res.status(400).send(result.error);
            }
            else if(!result.output.length){
                res.status(200).send([]);
            }
            else{
                res.status(200).send(result.output);
            }
        }                           
        else{
            res.status(400).send('Invalid delivery status');
        }
    } 
    catch (err) {
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

router.post('/sent', async (req, res) => {
    try {
        // req.body contains post office code and status type
        console.log(req.body);
        status_arr = ['on-route-receiver', 'receiver-unavailable', 'delivered', 
            'on-route-sender', 'sender-unavailable', 'sent-back', 'failed'];

        if (status_arr.includes(req.body.status)){
            let result = await Post_Office.get_reg_posts(req.body.post_office, 'sent', req.body.status);
            if(result.error){
                res.status(400).send(result.error);
            }
            else if(!result.output.length){
                res.status(200).send([]);
            }
            else{
                res.status(200).send(result.output);
            }
        }                           
        else{
            res.status(400).send('Invalid delivery status');
        }
    } 
    catch (err) {
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

module.exports = router;