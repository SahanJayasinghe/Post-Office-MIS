const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const Registered_Post = require('../models/Registered_Post');
const Normal_Post = require('../models/Normal_Post');

router.post('/', async (req, res) => {
    
    try {
        // req.body contains resident key embedded with address id ex: QM312U0Z 
        // key is the first 3 and the last 3 characters. in between is the id. ex: key=QM3U0Z id=12
        let address_id = req.body.key.slice(3, -3);
        let key = req.body.key.slice(0,3) + req.body.key.slice(-3);
        console.log(key);

        let address_result = await Address.get_address(address_id);
        
        if(address_result.error){
            res.status(400).send('Invalid key provided. Could not find an address.');
        }
        else if(address_result.output.resident_key != key){
            res.status(400).send('Invalid key provided. Could not find an address.');
        }
        else{
            let received_reg_posts = await Registered_Post.get_receiver_reg_posts(address_id);
            let sent_reg_posts = await Registered_Post.get_sender_reg_posts(address_id);
            let normal_post_details = await Normal_Post.get_normal_posts(address_id);

            if(received_reg_posts.error || sent_reg_posts.error || normal_post_details.error){
                res.status(400).send('An error occured while retreiving letter details');
            }
            else{
                let address_obj = address_result.output;
                let address = `${address_obj.number}, ${address_obj.street}, ${address_obj.sub_area}, 
                    ${address_obj.postal_area}, ${address_obj.postal_code}`;
                let result_obj = {
                    address: address,
                    received_reg_posts: received_reg_posts.output,
                    sent_reg_posts: sent_reg_posts.output,
                    normal_post_details: normal_post_details.output
                }
                res.status(200).send(result_obj);
            }
        }
    }
    catch(err) {
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }
});

module.exports = router;