const bcrpyt = require('bcrypt');
const Model = require('../../core/Model');
const Address = require('./Address');
const Postal_Area = require('./Postal_Area');
const helper = require('../../core/helper');

async function login(code, password){
    let result = await Model.select('postal_areas', '*', 'code = ?', code);
    console.log(result);
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else if(!result.query_output.length){
        return {output: null, error: 'Invalid postal code'};
    }
    else if(result.query_output[0].password == null){
        return {output: null, error: 'No Account Found'};
    }
    else{
        const match = await bcrpyt.compare(password, result.query_output[0].password);
        if(!match){
            return {output: null, error: 'Invalid password'};
        }
        else{
            let {code, name} = result.query_output[0];
            return {output: {code, name}, error: null};
        }
    }
}

async function get_reg_posts_by_status(post_office, sent_or_received, status){
    // post_office = 10400
    // status = 'on-route-receiver' or 'delivered' or 'receiver-unavailable' or etc..
    let status_arr = ['on-route-receiver', 'receiver-unavailable', 'on-route-sender', 'sender-unavailable'];
    let params = [post_office, status];
    let proc_result;
    
    if(status_arr.includes(status)){
        proc_result = await Model.call_procedure(`active_reg_posts_${sent_or_received}`, params);
    }
    else{
        proc_result = await Model.call_procedure(`completed_reg_posts_${sent_or_received}`, params);
    }

    // console.log(proc_result);
    if(proc_result.query_error){
        return {output: null, error: proc_result.query_error.message};
    }
    else{
        let result_arr = [];
        let result = {};

        console.log(proc_result.query_output[0]);
        reg_posts = proc_result.query_output[0];

        for (const reg_post of reg_posts) {
            console.log('inside for of loop');
            let rp_arr = [];
            rp_arr.push(reg_post.id);
            rp_arr.push(`${reg_post.speed_post}`);
            
            // rp_obj.receiver_name = reg_post.receiver_name;
            let receiver_obj = await Address.get_address_by_id(reg_post.receiver_id);
            // console.log(receiver_obj);
            if(receiver_obj.error){
                result.error = receiver_obj.error;
                return
            }
            else{
                let rec_address = helper.get_address_str(receiver_obj.output);
                rp_arr.push([reg_post.receiver_name, rec_address]);
            }

            // rp_obj.sender_name = reg_post.sender_name;
            let sender_obj = await Address.get_address_by_id(reg_post.sender_id);
            // console.log(sender_obj);
            if(sender_obj.error){
                result.error = sender_obj.error;
                return
            }
            else{
                let sen_address = helper.get_address_str(sender_obj.output);
                rp_arr.push([reg_post.sender_name, sen_address]);
            }
            
            if(status_arr.includes(status)){
                rp_arr.push(`${reg_post.current_area}, ${reg_post.current_code}`);
                rp_arr.push(helper.dt_local(reg_post.last_update));
            }

            if(['delivered', 'sent-back'].includes(status)){
                rp_arr.push(helper.dt_local(reg_post.delivered_datetime));
            }
            
            if(status !== 'on-route-receiver'){
                rp_arr.push(reg_post.delivery_attempts_receiver);
            }
            if(['sender-unavailable', 'sent-back', 'failed'].includes(status)){
                rp_arr.push(reg_post.delivery_attempts_sender);
            }            
            console.log(rp_arr);
            result_arr.push(rp_arr);
        }

        result.output = result_arr;
        console.log(result);
        return result;
        // return {output: result.query_output, error: null};
    }
}

async function get_reg_posts(post_office, sent_or_received){
    let status_arr;
    let result = {};
    let result_arr = [];
    if(sent_or_received == 'received'){
        status_arr = ['receiver-unavailable', 'on-route-receiver', 'on-route-sender', 'sender-unavailable', 'delivered', 'sent-back', 'failed'];
    }
    else if(sent_or_received == 'sent'){
        status_arr = ['sender-unavailable', 'on-route-sender', 'on-route-receiver', 'receiver-unavailable', 'sent-back', 'delivered', 'failed'];
    }

    for (let idx = 0; idx < status_arr.length; idx++) {
        let rp_category = await get_reg_posts_by_status(post_office, sent_or_received, status_arr[idx]);
        if(rp_category.error){
            result.error = rp_category.error;
            return
        }
        result_arr.push(rp_category.output);
    }
    if(result.error){
        return result;
    }
    result.output = result_arr;
    return result;
}

async function get_parcels_by_status(post_office, sent_or_received, status){
    let status_arr = ['on-route-receiver', 'receiver-unavailable'];
    let params = [post_office, status];
    let proc_result;

    if(status_arr.includes(status)){
        proc_result = await Model.call_procedure(`active_parcels_${sent_or_received}`, params);
    }
    else{
        proc_result = await Model.call_procedure(`completed_parcels_${sent_or_received}`, params);
    }

    console.log(proc_result);
    if(proc_result.query_error){
        return {output: null, error: proc_result.query_error.message};
    }
    else{
        let result_arr = [];
        let result = {};
        parcels = proc_result.query_output[0];
        for (const parcel of parcels) {
            let parcel_arr = [parcel.id];

            let receiver_address = ``;
            let pa_result = await Postal_Area.get_postal_area(parcel.receiver_code);
            if(pa_result.error){
                result.error = pa_result.error;
                return
            }
            else{
                receiver_address += `${parcel.receiver_number}, `;
                receiver_address += (parcel.receiver_street) ? `${parcel.receiver_street}, ` : ``;
                receiver_address += (parcel.receiver_sub_area) ? `${parcel.receiver_sub_area}, ` : ``;
                receiver_address += `${pa_result.output.name}, `;
                receiver_address += parcel.receiver_code;
            }
            parcel_arr.push([parcel.receiver_name, receiver_address]);

            if(sent_or_received === 'received'){
                let pa_result = await Postal_Area.get_postal_area(parcel.posted_location);
                if(pa_result.error){
                    result.error = pa_result.error;
                    return
                }
                parcel_arr.push(`${pa_result.output.name}, ${parcel.posted_location}`);
            }
            else{
                parcel_arr.push(helper.dt_local(parcel.posted_datetime));
            }

            if(status === 'on-route-receiver'){
                parcel_arr.push(`${parcel.current_area}, ${parcel.current_code}`);
            }
            
            if(status !== 'delivered'){
                parcel_arr.push(helper.dt_local(parcel.last_update));
            }
            else{
                parcel_arr.push(helper.dt_local(parcel.delivered_datetime));
            }

            if(status !== 'on-route-receiver'){
                parcel_arr.push(parcel.delivery_attempts);
            }

            result_arr.push(parcel_arr);
        }

        result.output = result_arr;
        console.log(result);
        return result;
    }
}

async function get_money_orders_by_status(post_office, sent_or_received, status){
    let status_arr = ['delivered', 'returned']; 
    let proc_result;

    if(status_arr.includes(status)){
        let params = [post_office, status];
        proc_result = await Model.call_procedure(`completed_money_orders_${sent_or_received}`, params);
    }
    else{
        proc_result = await Model.call_procedure(`active_money_orders_${sent_or_received}`, post_office);
    }

    if(proc_result.query_error){
        return {output: null, error: proc_result.query_error.message};
    }

    console.log(proc_result.query_output[0]);
    let money_orders = proc_result.query_output[0];
    let result_arr = [];
    let result = {};

    for (const mo_obj of money_orders) {
        let mo_arr = [mo_obj.id, mo_obj.sender_name, mo_obj.receiver_name];
        mo_arr.push(parseFloat(mo_obj.amount).toFixed(2));
        
        if(status_arr.includes(status)) {
            mo_arr.push(helper.dt_local(mo_obj.delivered_datetime));
        }
        else{
            let expire = helper.expiration_check(mo_obj.posted_datetime, mo_obj.expire_after);
            mo_arr.push(expire[1]);
        }

        (sent_or_received === 'received') 
        ? mo_arr.push(`${mo_obj.posted_area}, ${mo_obj.posted_code}`)
        : mo_arr.push(`${mo_obj.receiver_area}, ${mo_obj.receiver_code}`);
        
        mo_arr.push(helper.dt_local(mo_obj.posted_datetime));

        result_arr.push(mo_arr);
    }
    result.output = result_arr;
    console.log(result);
    return result;
}

module.exports = {
    login,
    get_reg_posts_by_status,
    get_parcels_by_status,
    get_money_orders_by_status,
    get_reg_posts
}