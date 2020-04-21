const Model = require('../../core/Model');
const Address = require('./Address');

async function create_reg_post(sender, receiver, post_office){
    // post office = 10400 (only code)
    let dt = new Date();
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`; 
    let insert_obj = {
        sender_id: sender,
        receiver_id: receiver,
        status: 'on-route-receiver',
        current_location: post_office,
        posted_datetime: dt_str,
        last_update: dt_str
    };
    let insert_result = await Model.insert('registered_posts', insert_obj);
    if(insert_result.query_error){
        return {output: null, error: insert_result.query_error.message};
    }
    return {output: insert_result.query_output, error: null};
}

async function update_location(reg_post_id, post_office){
    let dt = new Date();
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;
    let update_str = 'current_location = ?, last_update = ?';
    let params = [post_office, dt_str, reg_post_id];
    let update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

async function deliver_to_receiver(reg_post_id, post_office, status){
    // status = delivered or receiver-unavailable or on-route-sender
    let dt = new Date();
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;
    let update_result = null;

    if(status == 'delivered'){
        let update_str = 'status = ?, current_location = ?, delivery_attempts_receiver = delivery_attempts_receiver + 1, delivered_datetime = ?';
        let params = ['delivered', post_office, dt_str, reg_post_id];
        update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    }    
    else{
        let update_str = 'status = ?, current_location = ?, last_update = ?, delivery_attempts_receiver = delivery_attempts_receiver + 1';
        let params = [status, post_office, dt_str, reg_post_id];
        update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    }
    
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

async function send_back(reg_post_id){
    let dt = new Date();
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;
    let update_str = 'status = ?, last_update = ?';
    let params = ['on-route-sender', dt_str, reg_post_id];
    let update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

async function deliver_to_sender(reg_post_id, post_office, status){
    // status = sent-back or sender-unavailable or failed
    let dt = new Date();
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;
    let update_result = null;

    if(status == 'sent-back'){
        let update_str = 'status = ?, current_location = ?, delivery_attempts_sender = delivery_attempts_sender + 1, delivered_datetime = ?';
        let params = ['sent-back', post_office, dt_str, reg_post_id];
        update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    }
    else{
        let update_str = 'status = ?, current_location = ?, last_update = ?, delivery_attempts_sender = delivery_attempts_sender + 1';
        let params = [status, post_office, dt_str, reg_post_id];
        update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    }

    if(update_result.query_error){
        return {output: null, error: update_result.query_error.message};
    }
    return {output: update_result.query_output, error: null};
}

async function get_reg_post(reg_post_id){
    let reg_post = await Model.select('registered_posts', '*', 'id = ?', reg_post_id);
    if(!reg_post.query_output.length){
        return {output: null, error: 'Registered post id does not exist'};
    }
    else if(reg_post.query_error){
        return {output: null, error: reg_post.query_error.message};
    }

    let sender = await Address.get_address(reg_post.query_output[0].sender_id);
    if(sender.query_error){
        return {output: null, error: sender.query_error.message};
    }

    let receiver = await Address.get_address(reg_post.query_output[0].receiver_id);
    if(receiver.query_error){
        return {output: null, error: receiver.query_error.message};
    }

    let rec = receiver.query_output[0];
    let receiver_address = `${rec.number}, ${rec.street}, ${rec.state}, ${rec.postal_area}, ${rec.postal_code}`;
    let sen = sender.query_output[0];
    let sender_address = `${sen.number}, ${sen.street}, ${sen.state}, ${sen.postal_area}, ${sen.postal_code}`;
    let reg_post_obj = {
        id: reg_post_id,
        receiver_address: receiver_address,
        sender_address: sender_address,
        status: reg_post.query_output[0].status,
        current_location: reg_post.query_output[0].current_location,
        posted_dt: reg_post.query_output[0].posted_datetime,
        last_update: reg_post.query_output[0].last_update,
        attempts_rec: reg_post.query_output[0].delivery_attempts_receiver,
        attempts_sen: reg_post.query_output[0].delivery_attempts_sender,
        delivered_dt: reg_post.query_output[0].delivered_datetime
    };
    return {output: reg_post_obj, error: null};
}

module.exports = {
    create_reg_post,
    update_location,
    deliver_to_receiver,
    send_back,
    deliver_to_sender,
    get_reg_post
}