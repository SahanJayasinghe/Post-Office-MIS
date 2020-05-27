const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
    try {
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let key_check = (req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password'));
        let pw_length = 0;
        if (key_check) {pw_length = req.body.password.length;}

        if(body_length == 2 && key_check && pw_length > 0 && pw_length < 21){
            let result = await Admin.login(req.body.username, req.body.password);
            console.log(result);
            if(result.error){
                res.status(400).send(result.error);
            }
            else{
                let token_data = {
                    user_type: 'admin',
                    user_id: result.output.id
                }
                // secret key should be retrieved from environment variable (need npm Config package)
                const token = jwt.sign(token_data, 'SecretKey');
                console.log(token);
                res.status(200).send({token, username: result.output.username});
            }
        }
        else{
            res.status(400).send('Invalid details provided');
        }
    } 
    catch (err) {
        console.log('promise reject: ' + err.query_error);
        console.log(err);
        res.status(500).send('Server could not perform the action');
    }    
});

module.exports = router;