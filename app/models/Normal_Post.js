const Model = require('../../core/Model');
const Address = require('./Address');
const helper = require('../../core/helper');

async function create_normal_post(delivery_address_id, price){
    let result1 = await Model.select('normal_posts', '*', 'address_id = ?', delivery_address_id);
    console.log(result1);
    if(result1.query_error){
        return {output: null, error: result1.query_error.sqlMessage};
    }
    else if(!result1.query_output.length){
        insert_obj = {
            address_id: delivery_address_id,
            on_route_count: 1,
            delivered_count: 0,
            failed_delivery_count: 0,
            total_price: price
        }
        let insert_result = await Model.insert('normal_posts', insert_obj);
        // console.log('insert result');
        console.log(insert_result);
        if(insert_result.query_error){
            return {output: null, error: insert_result.query_error};
        }
        return {output: insert_result.query_output, error: null};
    }
    else{
        params = [result1.query_output[0].on_route_count + 1, result1.query_output[0].total_price + price, delivery_address_id];
        let update_result = await Model.update('normal_posts', 'on_route_count = ?, total_price = ?', 'address_id = ?', params);
        if(update_result.query_error){
            return {output: null, error: update_result.query_error.sqlMessage};
        }
        return {output: update_result.query_output, error: null};
    }
}

async function deliver_normal_post(delivery_address_id, post_office){
    let np_result = await Model.select('normal_posts', '*', 'address_id = ?', delivery_address_id);
    if (!np_result.query_output.length) {
        return {output: null, error: `There are no normal posts for the given address.`}
    }
    if (np_result.query_output[0].on_route_count === 0) {
        return {output: null, error: `There are no normal posts for the given address.`}
    }

    let address_result = await Model.select('addresses', 'postal_code', 'id = ?', delivery_address_id);
    if ( !address_result.query_output.length ) {
        return {output: null, error: 'No address by the given id'};
    }
    else if (address_result.query_output[0].postal_code !== post_office) {
        return {output: null, error: `Only the Receiver's Post Office ${address_result.query_output[0].postal_code} can deliver the letter`}
    }
    
    let update_str = 'on_route_count = on_route_count - 1, delivered_count = delivered_count + 1';
    let update_result = await Model.update('normal_posts', update_str, 'address_id = ?', delivery_address_id);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

async function cancel_delivery(address_id, post_office){
    let address_result = await Model.select('addresses', 'postal_code', 'id = ?', address_id);
    if ( !address_result.query_output.length ) {
        return {output: null, error: 'No address by the given id'};
    }
    else if (address_result.query_output[0].postal_code !== post_office) {
        return {output: null, error: `Only the Receiver's Post Office can discard the letter`}
    }

    let np_result = await Model.select('normal_posts', 'on_route_count, failed_delivery_count', 'address_id = ?', address_id);
    if ( !np_result.query_output.length){
        return {output: null, error: `There are no normal posts to this address`};
    }
    else if(np_result.query_output[0].on_route_count === 0){
        return {output: null, error: `There are no normal posts to this address`};
    }
    
    let update_str = 'on_route_count = on_route_count - 1, failed_delivery_count = failed_delivery_count + 1';
    let update_result = await Model.update('normal_posts', update_str, 'address_id = ?', address_id);
    console.log(update_result);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    let output = {};
    output.on_route_count = np_result.query_output[0].on_route_count - 1;
    output.failed_delivery_count = np_result.query_output[0].failed_delivery_count + 1;
    return {output, error: null};
}

async function get_normal_posts(address_id){
    let np_result = await Model.select('normal_posts', '*', 'address_id = ?', address_id);
    if (np_result.query_error){
        return {output: null, error: np_result.query_error.message};
    }
    else if (!np_result.query_output.length){
        return {output: null, error: 'No normal post letters received for this address'};
    }
    else if (np_result.query_output[0].on_route_count === 0){
        return {output: null, error: 'No normal post letters received for this address'};
    }
    else{
        let address_result = await Address.get_address_by_id(address_id);
        console.log(address_result);
        if(address_result.error){
            return address_result;
        }

        let address_arr = helper.get_address_array(address_result.output);
        let np_obj = np_result.query_output[0];
        np_obj.address = address_arr;

        return {output: np_obj, error: null};
    }
}

async function get_resident_normal_posts(resident_id){
    let np_result = await Model.select('normal_posts', '*', 'address_id = ?', resident_id);
    if (np_result.query_error){
        return {output: null, error: np_result.query_error.message};
    }
    else if(!np_result.query_output.length){
        return {output: {on_route: 0, delivered: 0, failed: 0}, error: null};
    }
    let {on_route_count, delivered_count, failed_delivery_count} = np_result.query_output[0];
    let np_obj = {on_route: on_route_count, delivered: delivered_count, failed: failed_delivery_count};
    return {output: np_obj, erro: null};
}

module.exports = {
    create_normal_post,
    deliver_normal_post,
    cancel_delivery,
    get_normal_posts,
    get_resident_normal_posts
}