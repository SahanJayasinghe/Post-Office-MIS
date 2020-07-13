const logger = require('../core/logger');

module.exports = function(err, req, res, next){
    // console.log(err);
    logger.error('error middleware', err);
    res.status(500).send('Server could not perform the action');
}