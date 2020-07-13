const Model = require('../../core/Model');
const Address = require('./Address');
const Postal_Area = require('./Postal_Area');
const helper = require('../../core/helper');

async function create_reg_post(sender, receiver, price, speed_post, post_office){
    // post office = 10400 (only code)
    if(sender.id == receiver.id){
        return {output: null, error: 'Sender and Receiver can not be the same'};
    }
    
    // let dt = new Date();
    // let date = dt.toLocaleDateString().split('/');
    // let time = dt.toTimeString().split(' ');
    // let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;
    let dt_str = helper.current_dt_str(); 
    
    let insert_obj = {
        sender_id: sender.id,
        sender_name: sender.name,
        receiver_id: receiver.id,
        receiver_name: receiver.name,
        price: price,
        speed_post: speed_post,
        status: 'on-route-receiver',
        current_location: post_office,
        posted_datetime: dt_str,
        last_update: dt_str
    };
    console.log(insert_obj);

    let insert_result = await Model.insert('registered_posts', insert_obj);
    if(insert_result.query_error){
        return {output: null, error: insert_result.query_error.message};
    }
    return {output: insert_result.query_output, error: null};
}

async function update_location(reg_post_id, post_office){
    let regpost_result = await Model.select('registered_posts', 'status, current_location', 'id = ?', reg_post_id);
    console.log(regpost_result);
    if(regpost_result.query_error){
        return {output: null, error: regpost_result.query_error.message};
    }
    else if(!regpost_result.query_output.length){
        return {output: null, error: 'Registered Post id does not exist'};
    }
    else if( !(['on-route-receiver', 'on-route-sender'].includes(regpost_result.query_output[0].status)) ){
        return {output: null, error: 'Registered Post is not on route to update location'};
    }
    else if(regpost_result.query_output[0].current_location == post_office){
        return {output: null, error: 'Registered Post location is already updated'};
    }
    else{
        let dt_str = helper.current_dt_str();
        let direction = regpost_result.query_output[0].status === 'on-route-sender';
        let update_query = {
            statement: `UPDATE registered_posts SET current_location = ?, last_update = ? WHERE id = ?`,
            params: [post_office, dt_str, reg_post_id]
        };

        let insert_query = {
            statement: `INSERT INTO reg_posts_route_info SET ?`,
            params: {reg_post_id, location: post_office, updated_at: dt_str, direction}
        };

        // let update_str = 'current_location = ?, last_update = ?';
        // let params = [post_office, dt_str, reg_post_id];
        // console.log(params);
        // let update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
        // console.log(update_result);
        // if(update_result.query_error){
        //     return {output: null, error: update_result.query_error.message};
        // }
        let trans_result = await Model.execute_transaction([update_query, insert_query]);
        console.log(trans_result);
        return {output: {last_location: post_office, last_update: dt_str}, error: null};
    }
}

async function deliver(reg_post_id, post_office){
    let reg_post_result = await Model.select('registered_posts', 'receiver_id, sender_id, status', 'id = ?', reg_post_id);
    if (!reg_post_result.query_output.length) {
        return {output: null, error: `Could not find a registered post record by the id ${reg_post_id}`};
    }
    let {status} = reg_post_result.query_output[0];
    if (status === 'delivered') {
        return {output: null, error: `This registered post is already delivered to receiver.`}
    }
    if (status === 'sent-back') {
        return {output: null, error: `This registered post is already returned to sender.`}
    }
    if (status === 'failed') {
        return {output: null, error: `This registered post is discarded by the sender's post office.`}
    }

    let dt_str = helper.current_dt_str();
    let update_result = null;

    if (['on-route-receiver', 'receiver-unavailable'].includes(status)) {
        let receiver_result = await Model.select('addresses', 'postal_code', 'id = ?', reg_post_result.query_output[0].receiver_id);
        if (receiver_result.query_output[0].postal_code !== post_office){
            return {output: null, error: `Receiver's post office ${receiver_result.query_output[0].postal_code} is authorized to deliver this post.`};
        }
        let update_str = 'status = ?, current_location = ?, last_update = ?, delivery_attempts_receiver = delivery_attempts_receiver + 1, delivered_datetime = ?';
        let params = ['delivered', post_office, dt_str, dt_str, reg_post_id];
        update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    }    
    else if(['on-route-sender', 'sender-unavailable'].includes(status)) {
        let sender_result = await Model.select('addresses', 'postal_code', 'id = ?', reg_post_result.query_output[0].sender_id);
        if (sender_result.query_output[0].postal_code !== post_office){
            return {output: null, error: `Sender's post office ${sender_result.query_output[0].postal_code} is authorized to deliver this post.`};
        }
        let update_str = 'status = ?, current_location = ?, last_update = ?, delivery_attempts_sender = delivery_attempts_sender + 1, delivered_datetime = ?';
        let params = ['sent-back', post_office, dt_str, dt_str, reg_post_id];
        update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    }
    
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

async function send_back(reg_post_id, post_office){
    let columns = 'current_location, status, delivery_attempts_receiver';
    let regpost_result = await Model.select('registered_posts', columns, 'id = ?', reg_post_id);
    console.log(regpost_result);
    if(regpost_result.query_error){
        return {output: null, error: regpost_result.query_error.message};
    }
    else if(!regpost_result.query_output.length){
        return {output: null, error: 'Registered Post id does not exist'};
    }

    let {current_location, status} = regpost_result.query_output[0];
    let attempts_rec = regpost_result.query_output[0].delivery_attempts_receiver;    
    
    if(status === 'receiver-unavailable' && attempts_rec > 0 && current_location === post_office){
        let dt_str = helper.current_dt_str();

        let update_query = {
            statement: `UPDATE registered_posts SET 'status = ?, last_update = ?' WHERE id = ?`,
            params: ['on-route-sender', dt_str, reg_post_id]
        };

        let insert_query = {
            statement: `INSERT INTO reg_posts_route_info SET ?`,
            params: {reg_post_id, location: post_office, updated_at: dt_str, direction: '1'}
        };

        let trans_result = await Model.execute_transaction([update_query, insert_query]);
        console.log(trans_result);

        // let update_str = 'status = ?, last_update = ?';
        // let params = ['on-route-sender', dt_str, reg_post_id];
        // let update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
        // console.log(update_result);
        // if(update_result.query_error){
        //     return {output: null, error: update_result.query_error.message};
        // }
        return {output: {status: 'on-route-sender', last_update: dt_str}, error: null};
    }
    else{
        let msg = '';
        if(status !== 'receiver-unavailable'){
            msg += 'Not allowed to return this registered post. ';
        }
        if (post_office !== current_location){
            msg += `Only the Post Office ${current_location} has the authority to return this post.`;
        }
        return {output: null, error: msg}
    }    
}

async function increment_attempts(reg_post_id, post_office){
    let reg_post_result = await Model.select('registered_posts', 'receiver_id, sender_id, status', 'id = ?', reg_post_id);
    if (!reg_post_result.query_output.length) {
        return {output: null, error: `Could not find a registered post record by the id ${reg_post_id}`};
    }
    let {status} = reg_post_result.query_output[0];
    if (status === 'delivered') {
        return {output: null, error: `This registered post is already delivered to receiver.`}
    }
    if (status === 'sent-back') {
        return {output: null, error: `This registered post is already returned to sender.`}
    }
    if (status === 'failed') {
        return {output: null, error: `This registered post is discarded by the sender's post office.`}
    }
    let dt_str = helper.current_dt_str();
    let update_result = null;

    if (['on-route-receiver', 'receiver-unavailable'].includes(status)) {
        let receiver_result = await Model.select('addresses', 'postal_code', 'id = ?', reg_post_result.query_output[0].receiver_id);
        if (receiver_result.query_output[0].postal_code !== post_office){
            return {output: null, error: `Receiver's post office ${receiver_result.query_output[0].postal_code} is authorized to handle delivery of this post.`};
        }
        let update_str = 'status = ?, current_location = ?, last_update = ?, delivery_attempts_receiver = delivery_attempts_receiver + 1';
        let params = ['receiver-unavailable', post_office, dt_str, reg_post_id];
        update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    }
    else if(['on-route-sender', 'sender-unavailable'].includes(status)) {
        let sender_result = await Model.select('addresses', 'postal_code', 'id = ?', reg_post_result.query_output[0].sender_id);
        if (sender_result.query_output[0].postal_code !== post_office){
            return {output: null, error: `Sender's post office ${sender_result.query_output[0].postal_code} is authorized to handle delivery of this post.`};
        }
        let update_str = 'status = ?, current_location = ?, last_update = ?, delivery_attempts_sender = delivery_attempts_sender + 1';
        let params = ['sender-unavailable', post_office, dt_str, reg_post_id];
        update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    }

    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

async function discard_reg_post(reg_post_id, post_office){
    let columns = 'current_location, status, delivery_attempts_sender';
    let regpost_result = await Model.select('registered_posts', columns, 'id = ?', reg_post_id);
    console.log(regpost_result);
    if(regpost_result.query_error){
        return {output: null, error: regpost_result.query_error.message};
    }
    else if(!regpost_result.query_output.length){
        return {output: null, error: 'Registered Post id does not exist'};
    }

    let {current_location, status} = regpost_result.query_output[0];
    let attempts_sen = regpost_result.query_output[0].delivery_attempts_sender;

    if(status === 'sender-unavailable' && attempts_sen > 0 && current_location === post_office){
        let dt_str = helper.current_dt_str();    
        let update_str = 'status = ?, last_update = ?';
        let params = ['failed', dt_str, reg_post_id];
        let update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
        console.log(update_result);
        if(update_result.query_error){
            return {output: null, error: update_result.query_error.message};
        }
        return {output: {status: 'failed', last_update: dt_str}, error: null};
    }
    else{
        let msg = '';
        if(status !== 'sender-unavailable'){
            msg += 'Not allowed to discard this registered post. ';
        }
        if (post_office !== current_location){
            msg += `Only the Post Office ${current_location} has the authority to discard this post.`;
        }
        return {output: null, error: msg}
    }
}

async function get_reg_post(reg_post_id){
    let reg_post = await Model.select('registered_posts', '*', 'id = ?', reg_post_id);
    console.log(reg_post);
    
    if(!reg_post.query_output.length){
        return {output: null, error: 'Registered post id does not exist'};
    }
    else if(reg_post.query_error){
        return {output: null, error: reg_post.query_error.message};
    }

    let receiver = await Address.get_address_by_id(reg_post.query_output[0].receiver_id);
    console.log(receiver);
    if(receiver.error){
        return receiver;
    }

    let sender = await Address.get_address_by_id(reg_post.query_output[0].sender_id);
    console.log(sender);
    if(sender.error){
        return sender;
    }

    let rec_arr = helper.get_address_array(receiver.output, reg_post.query_output[0].receiver_name);
    // let receiver_address = `${reg_post.query_output[0].receiver_name}, ${rec.number}, ${rec.street}, ${rec.sub_area}, ${rec.postal_area}, ${rec.postal_code}`;

    let sen_arr = helper.get_address_array(sender.output, reg_post.query_output[0].sender_name);
    // let sender_address = `${reg_post.query_output[0].sender_name}, ${sen.number}, ${sen.street}, ${sen.sub_area}, ${sen.postal_area}, ${sen.postal_code}`;

    let PA_result = await Postal_Area.get_postal_area(reg_post.query_output[0].current_location);
    let cur_loc;
    if(PA_result.error){
        return PA_result;
    }
    else{
        cur_loc = `${PA_result.output.name},${PA_result.output.code}`;
    }
    // let posted_dt = reg_post.query_output[0].posted_datetime.toString();
    // let update_dt = reg_post.query_output[0].last_update.toString();    
    let delivered_datetime = (reg_post.query_output[0].delivered_datetime) ? helper.dt_local(reg_post.query_output[0].delivered_datetime) : null;
    
    let reg_post_obj = {
        id: reg_post_id,
        receiver: rec_arr,
        sender: sen_arr,
        price: reg_post.query_output[0].price,
        speed_post: reg_post.query_output[0].speed_post,
        status: reg_post.query_output[0].status,
        current_location: cur_loc,
        posted_dt: helper.dt_local(reg_post.query_output[0].posted_datetime),
        last_update: helper.dt_local(reg_post.query_output[0].last_update),
        attempts_rec: reg_post.query_output[0].delivery_attempts_receiver,
        attempts_sen: reg_post.query_output[0].delivery_attempts_sender,
        delivered_dt: delivered_datetime
    };
    return {output: reg_post_obj, error: null};
}

async function get_route_info(id){
    // let reg_post_result = await Model.select('registered_posts', 'receiver_id, status', 'id = ?', id);
    // console.log(reg_post_result);
    // if(!reg_post_result.query_output.length){
    //     return {output: null, error: 'No registered post exists by the given id'};
    // }

    // let rec_postal_code;
    // let status_arr = ['on-route-receiver', 'receiver-unavailable', 'delivered'];
    // if( !status_arr.includes(reg_post_result.query_output[0].status) ){
    //     let address_result = await Model.select('addresses', 'postal_code', 'id = ?', reg_post_result.query_output[0].receiver_id);
    //     rec_postal_code = address_result.query_output[0].postal_code;
    // }

    let route_info = {return_route: [], delivery_route: []};
    // let index = 0;
    let route_result = await Model.call_procedure('reg_post_route', id);
    let route_result_len = route_result.query_output[0].length;

    if (route_result_len === 0){
        return {output: route_info, error: null};
    }

    for (let i = 0; i < route_result_len; i++) {
        const record = route_result.query_output[0][i];
        if(record.direction === 1){
            route_info['return_route'].push([record.name, record.code, helper.dt_local(record.updated_at)]);
        }
        else{
            route_info['delivery_route'].push([record.name, record.code, helper.dt_local(record.updated_at)]); 
        }
    }

    // for (let j = index; j < route_result.query_output.length; j++) {
    //     const record = route_result.query_output[j];
    //     route_info['delivery_route'].push([record.location, helper.dt_local(record.updated_at)]);
    // }

    return {output: route_info, error: null};
}

async function get_receiver_reg_posts(receiver_id){
    let result = await Model.select('reg_posts_sender_details', '*', 'receiver_id = ?', receiver_id);
    console.log(result);
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else if(!result.query_output.length){
        return {output: 'No registered post letters received for this address', error: null};
    }
    else{
        return {output: result.query_output, error: null};
    }
}

async function get_sender_reg_posts(sender_id){
    let result = await Model.select('reg_posts_receiver_details', '*', 'sender_id = ?', sender_id);
    console.log(result);
    if(result.query_error){
        return {output: null, error: result.query_error.message};
    }
    else if(!result.query_output.length){
        return {output: 'No registered post letters sent from this address', error: null};
    }
    else{
        return {output: result.query_output, error: null};
    }
}

async function get_resident_reg_posts_by_status(resident_id, sent_or_received, status){
    // status can be 'delivering', 'returning', 'delivered', 'sent-back', 'failed'
    let status_arr = ['delivering', 'returning'];
    let params = [resident_id, status];
    let proc_result;
    
    if(status_arr.includes(status)){
        proc_result = await Model.call_procedure(`resident_active_reg_posts_${sent_or_received}`, params);
    }
    else{
        proc_result = await Model.call_procedure(`resident_completed_reg_posts_${sent_or_received}`, params);
    }
    
    if(proc_result.query_error){
        return {output: null, error: proc_result.query_error.message};
    }
    let result = {};
    let result_arr = [];

    console.log(proc_result.query_output[0]);
    reg_posts = proc_result.query_output[0];

    for (const reg_post of reg_posts) {
        let rp_arr = [];
        rp_arr.push(reg_post.id);
        rp_arr.push(`${reg_post.speed_post}`);

        if(sent_or_received == 'received'){
            let sender_address_str = helper.get_address_str(reg_post);
            rp_arr.push([reg_post.sender_name, sender_address_str]); 
            rp_arr.push(reg_post.receiver_name);
        }
        else{
            rp_arr.push(reg_post.sender_name);
            let receiver_address_str = helper.get_address_str(reg_post);
            rp_arr.push([reg_post.receiver_name, receiver_address_str]);
        }

        if(status_arr.includes(status)){
            let pa_result = await Model.select('postal_areas', 'name', 'code = ?', reg_post.current_location);
            if(pa_result.query_error){
                result.error = pa_result.query_error;
                return;
            }
            else{                
                rp_arr.push(`${pa_result.query_output[0].name}, ${reg_post.current_location}`);
                rp_arr.push(helper.dt_local(reg_post.last_update));
            }
        }

        if(status == 'failed'){
            rp_arr.push(helper.dt_local(reg_post.last_update));
        }

        if(['delivered', 'sent-back'].includes(status)){
            rp_arr.push(helper.dt_local(reg_post.delivered_datetime));
        }

        rp_arr.push(reg_post.delivery_attempts_receiver);

        if(['returning', 'sent-back', 'failed'].includes(status)){
            rp_arr.push(reg_post.delivery_attempts_sender);
        }

        rp_arr.push(helper.dt_local(reg_post.posted_datetime));

        result_arr.push(rp_arr);
    }
    result.output = result_arr;
    console.log(result);
    return result;
}

module.exports = {
    create_reg_post,
    update_location,
    deliver,
    send_back,
    increment_attempts,
    discard_reg_post,
    get_reg_post,
    get_route_info,
    get_receiver_reg_posts,
    get_sender_reg_posts,
    get_resident_reg_posts_by_status
}