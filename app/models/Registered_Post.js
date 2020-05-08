const Model = require('../../core/Model');
const Address = require('./Address');

async function create_reg_post(sender, receiver, price, speed_post, post_office){
    // post office = 10400 (only code)
    if(sender.id == receiver.id){
        return {output: null, error: 'Sender and Receiver can not be the same'};
    }
    
    let dt = new Date();
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`; 
    
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
    let dt = new Date();
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;

    let update_str = 'current_location = ?, last_update = ?';
    let params = [post_office, dt_str, reg_post_id];
    console.log(params);
    let update_result = await Model.update('registered_posts', update_str, 'id = ?', params);
    console.log(update_result);
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
    console.log(reg_post);
    
    if(!reg_post.query_output.length){
        return {output: null, error: 'Registered post id does not exist'};
    }
    else if(reg_post.query_error){
        return {output: null, error: reg_post.query_error.message};
    }
    
    let sender = await Address.get_address(reg_post.query_output[0].sender_id);
    console.log(sender);
    if(sender.error){
        return sender;
    }

    let receiver = await Address.get_address(reg_post.query_output[0].receiver_id);
    console.log(receiver);
    if(receiver.error){
        return receiver;
    }

    let rec = receiver.output;
    let receiver_address = `${reg_post.query_output[0].receiver_name}, ${rec.number}, ${rec.street}, ${rec.sub_area}, ${rec.postal_area}, ${rec.postal_code}`;
    let sen = sender.output;
    let sender_address = `${reg_post.query_output[0].sender_name}, ${sen.number}, ${sen.street}, ${sen.sub_area}, ${sen.postal_area}, ${sen.postal_code}`;
    console.log('address arrays created');

    let posted_dt = reg_post.query_output[0].posted_datetime.toString();
    let update_dt = reg_post.query_output[0].last_update.toString();    

    let reg_post_obj = {
        id: reg_post_id,
        receiver_address: receiver_address,
        sender_address: sender_address,
        price: reg_post.query_output[0].price,
        speed_post: reg_post.query_output[0].speed_post,
        status: reg_post.query_output[0].status,
        current_location: reg_post.query_output[0].current_location,
        posted_dt: posted_dt,
        last_update: update_dt,
        attempts_rec: reg_post.query_output[0].delivery_attempts_receiver,
        attempts_sen: reg_post.query_output[0].delivery_attempts_sender,
        delivered_dt: reg_post.query_output[0].delivered_datetime
    };
    return {output: reg_post_obj, error: null};
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

module.exports = {
    create_reg_post,
    update_location,
    deliver_to_receiver,
    send_back,
    deliver_to_sender,
    get_reg_post,
    get_receiver_reg_posts,
    get_sender_reg_posts
}