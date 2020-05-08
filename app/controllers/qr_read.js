const express = require('express');
const router = express.Router();
// const Address = require('../models/Address');
const Registered_Post = require('../models/Registered_Post');

router.post('/', async (req, res) => {
    // req.body contains the qr code image
    // using qr library decode the qr into text
    // contains letter type(normal, reg_post, parcel) and addresses etc.
    console.log(req.body);
    let post_office = '01000';        // current post office - should be the logged in account
    if(req.body.type == 'reg_post'){
        try {
            let result = await Registered_Post.update_location(req.body.id, post_office);
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
        
    }
    else{
        res.status(200).send('normal post');
    }
});

module.exports = router;