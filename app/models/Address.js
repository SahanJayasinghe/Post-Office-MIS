const Model = require('../../core/Model');

async function get_address_by_id(id){
    let result1 = await Model.select('addresses', '*', 'id = ?', id);
    // console.log(result1);
    if (result1.query_error){
        return {output: null, error: result1.query_error.message};
    }
    else if (!result1.query_output.length){
        return {output: null, error: 'invalid id'};
    }
    else{
        let postal_code = result1.query_output[0].postal_code;
        let result2 = await Model.select('postal_areas', 'name', 'code = ?', postal_code);

        let address_obj = result1.query_output[0];
        address_obj.postal_area = result2.query_output[0].name;
        return {output: address_obj, error: null};
    }
}

async function get_address_by_details(input){
    // input = {number: 121\B, postal_code: 10400}
    // let postal_area = input.postal_area.split(',');    //split into an array [moratuwa, 10400]
    let pa_result = await Model.select('postal_areas', 'name', 'code = ?', input.postal_code);
    if(!pa_result.query_output.length) {
        return {output: null, error: `A postal area does not exist by the code ${input.postal_code}`};
    }

    let result = await Model.select('addresses', '*', 'number = ? AND postal_code = ?', [input.number, input.postal_code]);
    console.log(result);
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else if (!result.query_output.length){
        return {output: null, error: 'an address does not exist for the given house number and postal code'};
    }
    else{
        let address_obj = result.query_output[0];
        address_obj.postal_area = pa_result.query_output[0].name;
        return {output: address_obj, error: null};
    }
}

async function insert_address(address){
    // let code = address.postal_area.split(',')[1];
    let pa_result = await Model.select('postal_areas', 'name', 'code = ?', address.postal_code);
    console.log(pa_result);
    if (!pa_result.query_output.length){
        return {output: null, error: `A postal area does not exist by the code ${address.postal_code}`};
    }
    else if(pa_result.query_error){
        return {output: null, error: pa_result.query_error.message};
    }

    let address_result = await Model.select('addresses', 'id', 'number = ? AND postal_code = ?', [address.number, address.postal_code]);
    console.log(address_result);
    if (address_result.query_output.length){
        let pa = `${pa_result.query_output[0].name}, ${address.postal_code}`;
        return{
            output: null,
            error: `house number ${address.number} already exists in the postal area ${pa}.`
        };
    }
    else if (address_result.query_error){
        return {output: null, error: address_result.query_error.message};
    }

    let rand_str = '';
    let characters = 'ABCDEFGHIJKLM01234NOPQRSTUVWXYZ56789';
    for(let i=0; i<6; i++){
        let x = Math.floor(Math.random() * characters.length);
        rand_str += characters.charAt(x);
    }
    console.log(rand_str);

    let address_str = `${address.number}`;
    address.resident_key = rand_str;
    // delete address.postal_area;
    // address.postal_code = code;
    (address.street.trim() === '') ? delete address.street : address_str+=`, ${address.street}`;
    (address.sub_area.trim() === '') ? delete address.sub_area : address_str+=`, ${address.sub_area}`;
    address_str += `, ${pa_result.query_output[0].name}, ${address.postal_code}`;

    let insert_result = await Model.insert('addresses', address);
    console.log(insert_result);
    if(insert_result.query_error){
        return {output: null, error: insert_result.query_error.message};
    }
    else{
        return {output: {address: address_str, resident_key: rand_str}, error: null};
    }
}

async function get_addresses_by_area(postal_code){
    // let code = postal_area.split(',')[1];
    let pa_result = await Model.select('postal_areas', 'name', 'code = ?', postal_code);

    if (!pa_result.query_output.length){
        return {output: null, error: `A postal area does not exist by the code ${postal_code}`};
    }
    else if(pa_result.query_error){
        return {output: null, error: pa_result.query_error.message};
    }

    let address_result = await Model.select('addresses', '*', 'postal_code = ?', postal_code);
    if (address_result.query_error){
        return {output: null, error: address_result.query_error.message};
    }
    let output_arr = [];
    for (const ad_obj of address_result.query_output) {
        let ad_arr = [ad_obj.id, ad_obj.number];
        (ad_obj.street) ? ad_arr.push(ad_obj.street) : ad_arr.push('_');
        (ad_obj.sub_area) ? ad_arr.push(ad_obj.sub_area) : ad_arr.push('_');
        // let key = ad_obj.resident_key.slice(0,3) + `${ad_obj.id}` + ad_obj.resident_key.slice(3);
        ad_arr.push(ad_obj.resident_key);
        output_arr.push(ad_arr);
    }
    return {output: output_arr, error: null};
}

async function change_address(address_obj){
    let address_result = await Model.select('addresses', '*', 'id = ?', address_obj.id);
    console.log(address_result);
    if(!address_result.query_output.length){
        return {output: null, error: 'No existing address for the given id'};
    }
    else if(address_result.query_error){
        return {output: null,  error: address_result.query_error.message};
    }

    // let code = address_obj.postal_area.split(',')[1];       // postal_area: Moratuwa,10400
    let pa_result = await Model.select('postal_areas', 'name', 'code = ?', address_obj.postal_code);
    console.log(pa_result);
    if (!pa_result.query_output.length){
        return {output: null, error: `A postal area does not exist by the code ${address_obj.postal_code}.`};
    }
    else if(pa_result.query_error){
        return {output: null, error: pa_result.query_error.message};
    }

    let old_address = address_result.query_output[0];

    if(old_address.number != address_obj.number || old_address.postal_code != address_obj.postal_code){
        let result1 = await Model.select('addresses', 'id', 'number = ? AND postal_code = ?', [address_obj.number, address_obj.postal_code]);
        if(result1.query_output.length){
            let pa = `${pa_result.query_output[0].name}, ${address_obj.postal_code}`;
            return {
                output: null,
                error: `There is an address with the house number ${address_obj.number} in the postal area ${pa}.`
            };
        }
        else if(result1.query_error){
            return {output: null, error: result1.query_error.message};
        }
    }

    if(address_obj.street.trim() === '') {address_obj.street = null}
    if(address_obj.sub_area.trim() === '') {address_obj.sub_area = null}
    console.log(address_obj);

    let update_fields = [];
    let params = [];
    if(address_obj.number != old_address.number){
        // update_str += 'number = ?';
        update_fields.push('number = ?');
        params.push(address_obj.number);
    }
    if(address_obj.street != old_address.street){
        // update_str += ', street = ?';
        update_fields.push('street = ?');
        params.push(address_obj.street);
    }
    if(address_obj.sub_area != old_address.sub_area){
        // update_str += ', sub_area = ?';
        update_fields.push('sub_area = ?');
        params.push(address_obj.sub_area);
    }
    if(address_obj.postal_code != old_address.postal_code){
        // update_str += ', postal_code = ?';
        update_fields.push('postal_code = ?');
        // let new_id = `${code}-${prev_id.slice(6)}`;
        params.push(address_obj.postal_code);
    }

    console.log(params);
    if(!update_fields.length){
        return {output: null, error: 'Updated attributes are same as the existing ones'};
    }

    let update_str = update_fields.join();
    params.push(address_obj.id);
    let update_result = await Model.update('addresses', update_str, 'id = ?', params);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

async function get_resident_key(address_id){
    let result = await Model.select('addresses', 'resident_key', 'id = ?', address_id);
    console.log(result);
    if (result.query_error){
        return {output: null, error: result.query_error};
    }
    else if (!result.query_output.length){
        return {output: null, error: `Address does not exist.`};
    }
    else{
        return {output: result.query_output[0].resident_key, error: null};
    }
}

module.exports = {
    get_addresses_by_area,
    get_address_by_id,
    get_address_by_details,
    insert_address,
    change_address,
    get_resident_key
};