const Model = require('../../core/Model');
const bcrpyt = require('bcrypt');
const debug = require('debug')('po_mis:dev');

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

    debug(result);
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
    input_obj.name = input_obj.name.trim().toLowerCase();

    let result = await Model.select('postal_areas', '*', 'code = ?', input_obj.code);
    debug(result);

    if(result.query_output.length){
        let msg = `There is a postal area named ${result.query_output[0].name} with the given code ${input_obj.code}`;
        return {output: null, error: msg};
    }
    // else if(result.query_output.length == 1){
    //     let code_check = (result.query_output[0].code == input_obj.code);
    //     let name_check = (result.query_output[0].name == input_obj.name);
    //     if(code_check && name_check){
    //         return {output: null, error: `Postal area ${input_obj.name}, ${input_obj.code} already exists.`};
    //     }
    //     else if(code_check){
    //         return {output: null, error: `There is a postal area with the given code ${input_obj.code}. Area name is distinct`};
    //     }
    //     else{
    //         return {output: null, error: `There is a postal area with the given name ${input_obj.name}. Area code is distinct`};
    //     }
    // }
    else if(result.query_error){
        return {output: null, error: 'Database read error'};
    }

    let insert_result = await Model.insert('postal_areas', input_obj);
    if(insert_result.query_error){
        return {output: null, error: insert_result.query_error.message};
    }
    return {output: `${input_obj.name}, ${input_obj.code}`, error: null};
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
            return {output: null, error: update_result.query_error};
        }
        return {output: update_result.query_output, error: null};
    }
}

async function update_postal_area(code, name, prev_code){
    name = name.toLowerCase();
    let select_result = await Model.select('postal_areas', 'name', 'code = ?', prev_code);
    if(select_result.query_error){
        return {output: null, error: select_result.query_error.message};
    }
    else if(!select_result.query_output.length){
        return {output: null, error: `Update aborted. No existing record by the code ${prev_code}.`};
    }

    let update_fields = [];
    let params = [];
    let need_code_update = false;
    if(code !== prev_code){
        update_fields.push('code = ?');
        params.push(code);
        need_code_update = true;
    }
    if(name !== select_result.query_output[0].name){
        update_fields.push('name = ?');
        params.push(name);
    }
    debug(update_fields);
    if(update_fields.length == 0){
        return {output: null, error: 'Update values are same as the existing values'};
    }

    if(need_code_update){
        let pa_result = await Model.select('postal_areas', 'name', 'code = ?', code);
        if(pa_result.query_error){
            return {output: null, error: pa_result.query_error.message};
        }
        else if(pa_result.query_output.length){
            return {output: null, error: `Update aborted. Postal Area exists by the code ${code}. Postal Code must be unique.`};
        }
    }

    let update_str = update_fields.join();
    params.push(prev_code);
    let update_result = await Model.update('postal_areas', update_str, 'code = ?', params);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
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

async function get_postal_areas_by_province(input){
    // input is a digit (1 to 9)
    let condition = (input === '1') ? `code LIKE '1%' OR code LIKE '0%'` : `code LIKE '${input}%'`;
    let result = await Model.select('postal_areas', '*', condition);
    debug(result);

    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else{
        prov_pa = {};
        for (const postal_area of result.query_output) {
            let key = postal_area.name.toLowerCase()[0];
            let pa_obj = {code: postal_area.code, name: postal_area.name};
            pa_obj.hasAcc = (postal_area.password == null) ? '0' : '1';
            if(prov_pa.hasOwnProperty(key)){
                prov_pa[key].push(pa_obj);
            }
            else{
                prov_pa[key] = [pa_obj];
            }
        }
        debug(prov_pa);
        return {output: prov_pa, error: null};
    }
}

module.exports = {
    get_postal_area,
    get_all_postal_areas,
    insert_postal_area,
    create_postal_account,
    update_postal_area,
    postal_areas_without_account,
    postal_areas_with_account,
    get_postal_areas_by_province
};