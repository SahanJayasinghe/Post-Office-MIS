const bcrpyt = require('bcrypt');
const Model = require('../../core/Model');
const helper = require('../../core/helper');

async function create_money_order(input) {
    // input = {sender_name, receiver_name, receiver_postal_code, amount, price, expire_after, posted_location}
    let pa_result = await Model.select('postal_areas', 'name', 'code = ?', input.receiver_postal_code);
    console.log(pa_result);
    if (pa_result.query_error){
        return {output: null, error: pa_result.query_error};
    }
    else if (!pa_result.query_output.length){
        return {output: null, error: `No Postal Area by the code ${input.receiver_postal_code}`};
    }

    input.sender_name = input.sender_name.trim();
    input.receiver_name = input.receiver_name.trim();
    input.status = 'created';

    let dt_str = helper.current_dt_str();
    input.posted_datetime = dt_str;
    // let dt_arr = dt_str.split(':');
    // let posted_dt = `${dt_arr[0]}:${dt_arr[1]}:00`;
    // input.posted_datetime = posted_dt;

    let rand_str = '';
    let characters = 'ABCDEFGHIJKLM01234NOPQRSTUVWXYZ56789';
    for(let i=0; i<6; i++){
        let x = Math.floor(Math.random() * characters.length);
        rand_str += characters.charAt(x);
    }
    console.log(rand_str);

    let salt = await bcrpyt.genSalt(10);
    let hash_key = await bcrpyt.hash(rand_str, salt);
    input.secret_key = hash_key;

    console.log(input);
    let insert_result = await Model.insert('money_orders', input);
    console.log(insert_result)
    if (insert_result.query_error){
        return {output: null, error: insert_result.query_error};
    }
    let id = `${insert_result.query_output.insertId}`;
    let output_obj = {id, sender_name: input.sender_name, receiver_name: input.receiver_name, created_at: dt_str, secret_key: rand_str};
    return {output: output_obj, error: null};
}

async function verify_money_order(input, customer){
    // customer = receiver | sender
    let {sender_name, receiver_name, id, secret_key, post_office} = input;

    let select_result = await Model.select('money_orders', '*', 'id = ?', id);
    console.log(select_result);
    if (select_result.query_error){
        return {output: null, error: select_result.query_error};
    }
    else if (!select_result.query_output.length){
        return {output: null, error: `Money Order of id ${id} does not exist.`};
    }
    if (customer === 'receiver' && post_office !== select_result.query_output[0].receiver_postal_code) {
        let {receiver_postal_code} = select_result.query_output[0];
        return {output: null, error: `Money Order can only be received by the post_office ${receiver_postal_code}.`};
    }

    if (customer === 'sender' && post_office !== select_result.query_output[0].posted_location){
        let {posted_location} = select_result.query_output[0];
        return {output: null, error: `Money Order can only be returned by the post_office ${posted_location}.`};
    }

    let sender_check = sender_name.trim().toLowerCase() === select_result.query_output[0].sender_name.toLowerCase();
    let receiver_check = receiver_name.trim().toLowerCase() === select_result.query_output[0].receiver_name.toLowerCase();

    let error_msgs = [];
    if (!sender_check){
        error_msgs.push(`Sender's name ${sender_name} does not match.`);
    }
    if (!receiver_check){
        error_msgs.push(`Receiver's Name ${receiver_name} does not match.`);
    }

    if (error_msgs.length){
        let error = error_msgs.join(' ');
        error += ' Check spellings and spacing. Case is not checked at the verification.';
        return {output: null, error};
    }

    let hashed_key = select_result.query_output[0].secret_key;
    const match = await bcrpyt.compare(secret_key, hashed_key);
    if (!match) {
        return {output: null, error: 'Invalid Key Code.'};
    }
    let {posted_datetime, expire_after} = select_result.query_output[0];
    let [is_expired, expire_at] = helper.expiration_check(posted_datetime, expire_after);

    let delivered_at = (select_result.query_output[0].status !== 'created')
    ? helper.dt_local(select_result.query_output[0].delivered_datetime)
    : null;

    let output_obj = {
        id: select_result.query_output[0].id,
        sender_name: select_result.query_output[0].sender_name,
        receiver_name: select_result.query_output[0].receiver_name,
        status: select_result.query_output[0].status,
        posted_at: helper.dt_local(select_result.query_output[0].posted_datetime),
        expire_at,
        is_expired,
        amount: parseFloat(select_result.query_output[0].amount).toFixed(2),
        delivered_at
    };
    if (customer === 'sender') {
        let return_expire = helper.expiration_check(posted_datetime, 24);
        output_obj.return_expire_at = return_expire[1];
        output_obj.is_return_expired = return_expire[0];
    }
    return {output: output_obj, error: null};
}

async function deliver_money_order(id, secret_key, post_office){
    let columns = 'status, receiver_postal_code, expire_after, posted_datetime, secret_key, delivered_datetime';
    let select_result = await Model.select('money_orders', columns, 'id = ?', id);
    console.log(select_result);
    if (select_result.query_error){
        return {output: null, error: select_result.query_error};
    }
    else if (!select_result.query_output.length){
        return {output: null, error: `Money Order of id ${id} does not exist.`};
    }

    if(select_result.query_output[0].receiver_postal_code !== post_office){
        let rec_po = select_result.query_output[0].receiver_postal_code;
        return {output: null, error: `Only the receiver's post office ${rec_po} can deliver the money order.`};
    }
    const match = await bcrpyt.compare(secret_key, select_result.query_output[0].secret_key);
    if(!match){
        return {output: null, error: 'key code verification failed.'};
    }

    if(select_result.query_output[0].status !== 'created'){
        let {status, delivered_datetime} = select_result.query_output[0];
        let delivered_at = helper.dt_local(delivered_datetime);
        return {output: null, error: `Money Order has been ${status} at ${delivered_at}`};
    }

    let {posted_datetime, expire_after} = select_result.query_output[0];
    let [is_expired, expire_at] = helper.expiration_check(posted_datetime, expire_after);

    if(is_expired){
        return {output: null, error: `Money Order has been expired at ${expire_at}.`};
    }

    let dt_str = helper.current_dt_str();
    let params = ['delivered', dt_str, id];
    let update_result = await Model.update('money_orders', 'status = ?, delivered_datetime = ?', 'id = ?', params);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error};
    }
    return {output: {status: 'delivered', delivered_at: dt_str}, error: null};
}

async function return_money_order(id, secret_key, post_office){
    let columns = 'status, posted_location, posted_datetime, secret_key, delivered_datetime';
    let select_result = await Model.select('money_orders', columns, 'id = ?', id);
    console.log(select_result);
    if (select_result.query_error){
        return {output: null, error: select_result.query_error};
    }
    else if (!select_result.query_output.length){
        return {output: null, error: `Money Order of id ${id} does not exist.`};
    }

    if(select_result.query_output[0].posted_location !== post_office){
        let posted_loc = select_result.query_output[0].posted_location;
        return {output: null, error: `Only the post office ${posted_loc} where money order is posted can return the money order.`};
    }
    const match = await bcrpyt.compare(secret_key, select_result.query_output[0].secret_key);
    if(!match){
        return {output: null, error: 'key code verification failed.'};
    }

    if(select_result.query_output[0].status !== 'created'){
        let {status, delivered_datetime} = select_result.query_output[0];
        let delivered_at = helper.dt_local(delivered_datetime);
        return {output: null, error: `Money Order has been ${status} at ${delivered_at}`};
    }

    let {posted_datetime} = select_result.query_output[0];
    let [is_expired, expire_at] = helper.expiration_check(posted_datetime, 24);

    if(is_expired){
        return {output: null, error: `Money Order return duration expired at ${expire_at}.`};
    }

    let dt_str = helper.current_dt_str();
    let params = ['returned', dt_str, id];
    let update_result = await Model.update('money_orders', 'status = ?, delivered_datetime = ?', 'id = ?', params);
    if(update_result.query_error){
        return {output: null, error: update_result.query_error};
    }
    return {output: {status: 'returned', delivered_at: dt_str}, error: null};
}

module.exports = {
    create_money_order,
    verify_money_order,
    deliver_money_order,
    return_money_order
}