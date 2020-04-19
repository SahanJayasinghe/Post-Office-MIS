const Model = require('../../core/Model');

async function create_normal_post(delivery_address_id){
    let result1 = await Model.select('normal_posts', '*', 'address_id = ?', delivery_address_id);
    if(result1.query_error){
        return {output: null, error: result1.query_error.message};
    }
    else if(!result1.query_output.length){
        insert_obj = {
            address_id: delivery_address_id,
            on_route_count: 1,
            delivered_count: 0,
            failed_delivery_count: 0
        }
        let insert_result = await Model.insert('normal_posts', insert_obj);
        if(insert_result.query_error){
            return {output: null, error: insert_result.query_error.message};
        }
        return {output: insert_result.query_output, error: null};
    }
    else{
        params = [result1.query_output[0].on_route_count + 1, delivery_address_id];
        let update_result = await Model.update('normal_posts', 'on_route_count = ?', 'address_id = ?', params);
        if(update_result.query_error){
            return {output: null, error: update_result.query_error.message};
        }
        return {output: update_result.query_output, error: null};
    }
}

async function deliver_normal_post(delivery_address_id){
    let update_str = 'on_route_count = on_route_count - 1, delivered_count = delivered_count + 1';
    let update_result = await Model.update('normal_posts', update_str, 'address_id = ?', delivery_address_id);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

async function cancel_delivery(delivery_address_id){
    let update_str = 'on_route_count = on_route_count - 1, failed_delivery_count = failed_delivery_count + 1';
    let update_result = await Model.update('normal_posts', update_str, 'address_id = ?', delivery_address_id);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

module.exports = {
    create_normal_post,
    deliver_normal_post,
    cancel_delivery
}