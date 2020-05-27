const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const helper = require('../../core/helper');
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
        // body contains {number: '121/B', street: 'Temple Rd.', sub_area: 'Rawathawatta', postal_area: 'moratuwa,10400'}
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
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');      
    }    
});

router.put('/:id', async (req, res) => {
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
        console.log('promise reject: ' + err.query_error);
        res.status(500).send('Server could not perform the action');   
    }  
});

router.post('/area', async (req, res) => {
    try {
        // body contains {postal_area: moratuwa,10400}
        console.log(req.body);
        let body_length = Object.keys(req.body).length;
        let code_check = false;
        if (req.body.hasOwnProperty('postal_area')){
            let pa_arr = req.body.postal_area.split(',');        
            code_check = (pa_arr.length == 2) && /^\d{5}$/.test(pa_arr[1]);
        }

        if(body_length == 1 && code_check){
            let result = await Address.get_addresses_by_area(req.body.postal_area);
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