const Model = require('../../core/Model');
const bcrpyt = require('bcrypt');

async function login(username, password){
    let result = await Model.select('admins', '*', 'username = ?', username);
    console.log(result);
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
            return {output: `${result.query_output[0].id}`, error: null};
        }
    }
}

module.exports = {
    login
}