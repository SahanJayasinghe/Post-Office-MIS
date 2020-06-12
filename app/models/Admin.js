const config = require('config');
const jwt = require('jsonwebtoken');
const bcrpyt = require('bcrypt');
const debug = require('debug')('po_mis:dev');
const Model = require('../../core/Model');

async function login(username, password){
    let result = await Model.select('admins', '*', 'username = ?', username);
    debug(result);
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else if(!result.query_output.length){
        return {output: null, error: 'Invalid username'};
    }
    else{
        const match = await bcrpyt.compare(password, result.query_output[0].password);
        if(!match){
            return {output: null, error: 'Invalid password'};
        }
        else{
            let admin_obj = {id: result.query_output[0].id, username}
            return {output: admin_obj, error: null};
        }
    }
}

function generate_admin_token(id){
    let token_data = {
        user_type: 'admin',
        user_id: id
    }
    // secret key should be retrieved from environment variable (need npm Config package)
    const token = jwt.sign(token_data, config.get('jwtPrivateKey'));
    debug(token);
    return token;
}

module.exports = {
    login,
    generate_admin_token
}