const Model = require('../../core/Model');

async function get_postal_area(input){
    //input can be postal code or area name
    const pattern = /^\d+$/;
    let is_digit = pattern.test('input');
    console.log(is_digit);
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
    let result = await Model.select('postal_areas', '*');
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else{
        return {output: result.query_output, error: null};
    }
}

async function insert_postal_area(input_obj){
    input_obj.name = input_obj.name.toLowerCase(); 

    let result1 = await Model.select('postal_areas', '*', 'code = ?', input_obj.code);
    let result2 = await Model.select('postal_areas', '*', 'name = ?', input_obj.name);

    if(result1.query_output.length && result2.query_output.length){
        return {output: null, error: 'There is a postal area with the given code and name'};
    }
    else if(result1.query_output.length){
        return {output: null, error: 'There is a postal area with the given code. Given area name is distinct'};
    }
    else if(result2.query_output.length){
        return {output: null, error: 'There is a postal area with the given name. Given area code is distinct'};
    }
    else if(result1.query_error || result2.query_error){
        return {output: null, error: 'Database read error'};
    }

    let insert_result = await Model.insert('postal_areas', input_obj);
    if(insert_result.query_error){
        return {output: null, error: insert_result.query_error.message};
    }
    return {output: input_obj, error: null};
}

module.exports = {
    get_postal_area,
    get_all_postal_areas,
    insert_postal_area
};