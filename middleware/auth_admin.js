const jwt = require('jsonwebtoken');
const config = require('config');
const debug = require('debug')('po_mis:dev');

function auth_admin(req, res, next) {
    debug('authorizing...');
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Access denied. No token provided');

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        if (decoded.user_type === 'admin'){
            debug('authorization successfull.');
            req.admin = decoded.user_id;
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

module.exports = auth_admin;