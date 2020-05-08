const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

router.post('/', async (req, res) => {
    try {
        console.log(req.body);
        let result = await Admin.login(req.body.username, req.body.password);
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

module.exports = router;