const Model = require('../../core/Model');
const bcrpyt = require('bcrypt');

async function get_postal_area(input){
    //input can be postal code or area name
    const pattern = /^\d+$/;
    let is_digit = pattern.test(input);
    // console.log(is_digit);
    let result;

    if (is_digit){
        result = await Model.select('postal_areas', '*', 'code = ?', input);
        // if(result1.query_error){
        //     return {output: null, error: result1.query_error.message};
        // }
        // return result1;
    }
    else{
        result = await Model.select('postal_areas', '*', 'name = ?', input.toLowerCase());
        // if(result2.query_error){
        //     return {output: null, error: result2.query_error.message};
        // }
        // return result2;
    }

    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else if(!result.query_output.length){
        return {output: null, error: `No Postal Area for the given input ${input}`};
    }
    return {output: result.query_output[0], error: null};
}

async function get_all_postal_areas(){
    let result = await Model.select('postal_areas', 'code, name');
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else{
        return {output: result.query_output, error: null};
    }
}

async function insert_postal_area(input_obj){
    input_obj.name = input_obj.name.toLowerCase(); 

    let result = await Model.select('postal_areas', '*', 'code = ? OR name = ?', [input_obj.code, input_obj.name]);
    // let result2 = await Model.select('postal_areas', '*', 'name = ?', input_obj.name);

    if(result.query_output.length == 2){
        return {output: null, error: 'There is a postal area with the given code and another postal area with the given name'};
    }
    else if(result.query_output.length == 1){
        let code_check = (result.query_output[0].code == input_obj.code);
        let name_check = (result.query_output[0].name == input_obj.name);
        if(code_check && name_check){
            return {output: null, error: 'There is a postal area with the given code and name'};
        }
        else if(code_check){
            return {output: null, error: 'There is a postal area with the given code. Area name is distinct'};
        }
        else{
            return {output: null, error: 'There is a postal area with the given name. Area code is distinct'};
        }
    }
    else if(result.query_error){
        return {output: null, error: 'Database read error'};
    }

    let insert_result = await Model.insert('postal_areas', input_obj);
    if(insert_result.query_error){
        return {output: null, error: insert_result.query_error.message};
    }
    return {output: input_obj, error: null};
}

async function create_postal_account(code, password){
    let result = await Model.select('postal_areas', '*', 'code = ?', code);
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else if(!result.query_output.length){
        return {output: null, error: `No Postal Area for the given postal code ${code}`};
    }
    else if(result.query_output[0].password != null){
        return {output: null, error: `Account exists for the postal area ${code}`};
    }
    else{
        let salt = await bcrpyt.genSalt(10);
        let hash_pw = await bcrpyt.hash(password, salt);
        let update_result = await Model.update('postal_areas', 'password = ?', 'code = ?', [hash_pw, code]);
        if(update_result.query_error){
            return {output: null, error: update_result.query_error.sqlMessage};
        }
        return {output: update_result.query_output, error: null};
    }
}

async function postal_areas_without_account(){
    let result = await Model.select('postal_areas', 'code, name', 'password is NULL');
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else{
        return {output: result.query_output, error: null};
    }
}

async function postal_areas_with_account(){
    let result = await Model.select('postal_areas', 'code, name', 'password is NOT NULL');
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else{
        return {output: result.query_output, error: null};
    }
}

module.exports = {
    get_postal_area,
    get_all_postal_areas,
    insert_postal_area,
    create_postal_account,
    postal_areas_without_account,
    postal_areas_with_account
};