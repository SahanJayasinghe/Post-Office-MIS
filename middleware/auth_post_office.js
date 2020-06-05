const jwt = require('jsonwebtoken');

function auth_post_office(req, res, next) {
    console.log('authorizing...');
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Access denied. No token provided');

    try {
        const decoded = jwt.verify(token, 'SecretKey');
        console.log(decoded);
        if (decoded.user_type == 'post_office'){
            console.log('authorization successfull.');
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