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

module.exports = router;