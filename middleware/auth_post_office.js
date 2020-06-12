const jwt = require('jsonwebtoken');
const config = require('config');
const debug = require('debug')('po_mis:dev');

function auth_post_office(req, res, next) {
    debug('authorizing...');
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Access denied. No token provided');

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        debug(decoded);
        if (decoded.user_type == 'post_office'){
            debug('authorization successfull.');
            req.post_office = decoded.user_id;
            next();
        }
        else{
            res.status(403).send('Access prohibited.');
        }
    } 
    catch (err) {
        res.status(400).send('Invalid token');
    }
}

module.exports = auth_post_office;