const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
// console.log(Address);

router.get('/:id', async (req, res) => {
    try{
        // console.log('going into app/controllers/addresses/id');
        // let sql = 'SELECT * FROM contacts WHERE id = ?';
        let id = req.params.id;
        // select_contacts(id);
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
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');
    }

    // DB.query('SELECT * FROM contacts WHERE id = ?', id)
    //     .then(rows => {
    //         res.status(200).send(rows);
    //     })
    //     .catch(err => {
    //         res.status(400).send(err.message);
    //     })    
});

router.post('/', async (req, res) => {
    try{
        // let fields = ['name', 'email', 'address'];
        console.log(req.body);
        // let values = [req.body.name, req.body.email, req.body.address];
        
        let result = await Address.insert_address(req.body);
        console.log(result);
        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
        }
    }
    catch(err){
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');      
    }    
});

router.put('/:id', async (req, res) => {
    try{
        console.log(req.body);
        let address_obj = req.body;
        address_obj.id = req.params.id;
        let result = await Address.change_address(address_obj);
        console.log(result);
        if(result.error){
            res.status(400).send(result.error);
        }
        else{
            res.status(200).send(result.output);
        }
    }
    catch(err){
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');   
    }  
});

module.exports = router;