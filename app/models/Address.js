const Model = require('../../core/Model');

async function get_address(input){
    //input can be id or an object containing address details ex: {number: 121\B, postal_area: Moratuwa,10400}
    if (typeof input == 'string'){
        let result1 = await Model.select('addresses', '*', 'id = ?', input);
        if (result1.query_error){
            return {output: null, error: 'invalid id'};
        }
        else{
            let postal_code = result1.query_output[0].postal_code;
            let result2 = await Model.select('postal_areas', 'name', 'code = ?', postal_code);
            let postal_area = result2.query_output[0].name;
            let address_obj = result1.query_output[0];
            address_obj.postal_area = postal_area;
            return {output: address_obj, error: null};
        }
    }
    else{
        let postal_area = input.postal_area.split(',');    //split into an array [Moratuwa, 10400]
        // let conditions = Object.getOwnPropertyNames(input);
        // let params = Object.values(input);
        let result3 = Model.select('addresses', '*', 'number = ? AND postal_code = ?', [input.number, postal_area[1]]);
        if(result3.query_error){
            return {output: null, error: error.message};
        }
        else{
            let address_obj = result3.query_output;
            address_obj.postal_area = postal_area[0];
            return {output: address_obj, error: null};
        }
    }
}

async function insert_address(address){
    let code = address.postal_area.split(',')[1];
    let result1 = await Model.select('postal_areas', '*', 'code = ?', code);
    // console.log(result1);
    if (!result1.query_output.length){
        return {output: null, error: "Invalid postal area"};
    }
    else if(result1.query_error){
        return {output: null, error: result1.query_error.message};
    }
    // let postal_code = result1.query_output[0].code;
    console.log(result1.query_output);
    // console.log(postal_code);

    let result2 = await Model.select('addresses', 'id', 'number = ? AND postal_code = ?', [address.number, code]);
    console.log(result2);
    if (result2.query_output.length){
        return{
            output: null, 
            error: `house number ${address.number} already exists in the postal area ${address.postal_area}`
        };
    }
    else if (result2.query_error){
        return {output: null, error: result2.query_error.message};
    }

    let rand_str = '';
    let characters = 'ABCDEFGHIJKLM01234NOPQRSTUVWXYZ56789';
    for(let i=0; i<6; i++){
        let x = Math.floor(Math.random() * characters.length);
        rand_str += characters.charAt(x);
    }

    // let timestamp = `${new Date().getTime()}`;
    // console.log(`timestamp_id: ${timestamp}`);
    // let time_str = timestamp.slice(0,4) + '-' + timestamp.slice(4,8) + '-' + timestamp.slice(8); 
    // address.id = `${postal_code}-${rand_str}-${time_str}`;
    address.resident_key = rand_str; 
    delete address.postal_area;
    address.postal_code = code;

    let result3 = await Model.insert('addresses', address);
    if(result3.query_error){
        return {output: null, error: result3.query_error.message};
    }
    else{
        return {output: result3.query_output, error: null};
    }    
}

async function get_addresses_by_area(postal_area){
    // input parameter looks like Moratuwa,10400
    let code = postal_area.split(',')[1];
    let result1 = await Model.select('postal_areas', '*', 'code = ?', code);
    if (!result1.query_output.length){
        return {output: null, error: "Invalid postal area"};
    }
    else if(result1.query_error){
        return {output: null, error: result1.query_error.message};
    }
    let result2 = await Model.select('addresses', '*', 'postal_code = ?', code);
    if (result2.query_error){
        return {output: null, error: result2.query_error.message};
    }
    return result2;
}

async function change_address(address_obj){
    let address_result = await Model.select('addresses', '*', 'id = ?', address_obj.id);
    if(!address_result.query_output.length){
        return {output: null, error: 'No existing address for the given id'};
    }
    else if(address_result.query_error){
        return {output: null,  error: address_result.query_error.message};
    }
    
    let code = address_obj.postal_area.split(',')[1];       // postal_area: Moratuwa,10400

    if(address_result.query_output[0].number != address_obj.number || address_result.query_output[0].postal_code != code){
        let result1 = await Model.select('addresses', 'id', 'number = ? AND postal_code = ?', [address_obj.number, code]);
        if(result1.query_output.length){
            return {output: null, error: 'There is an address with the given house number in the postal area'};
        }
        else if(result1.query_error){
            return {output: null, error: result1.query_error.message};
        }
    }

    // let prev_id = address_result.query_output[0].id;
    let update_str = '';
    let params = [];
    if(address_obj.number != address_result.query_output[0].number){
        update_str += 'number = ?';
        params.push(address_obj.number);
    }
    if(address_obj.street != address_result.query_output[0].street){
        update_str += ', street = ?';
        params.push(address_obj.street);
    }
    if(address_obj.state != address_result.query_output[0].state){
        update_str += ', state = ?';
        params.push(address_obj.state);
    }
    if(code != address_result.query_output[0].postal_code){
        update_str += ', postal_code = ?';        
        // let new_id = `${code}-${prev_id.slice(6)}`;
        params.push(code);
    }
    
    if(update_str == ''){
        return {output: null, error: 'Updated attributes are same as the existing ones'};
    }

    params.push(address_obj.id);
    let update_result = await Model.update('addresses', update_str, 'id = ?', params);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

module.exports = { 
    get_addresses_by_area,
    get_address,
    insert_address,
    change_address
};