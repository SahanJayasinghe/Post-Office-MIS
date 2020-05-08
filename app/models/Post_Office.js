const Model = require('../../core/Model');
const Address = require('./Address');

async function get_reg_posts(post_office, sent_or_received, status){
    // post_office = 10400
    // status = 'on-route-receiver' or 'delivered' or 'receiver-unavailable' or etc..
    let status_arr = ['on-route-receiver', 'receiver-unavailable', 'on-route-sender', 'sender-unavailable'];
    let params = [post_office, status];
    let proc_result;
    if(sent_or_received === 'received'){
        if(status_arr.includes(status)){
            proc_result = await Model.call_procedure('active_reg_posts_received', params);
        }
        else{
            proc_result = await Model.call_procedure('completed_reg_posts_received', params);
        }
        // proc_result = await Model.call_procedure('received_reg_posts_by_status', params);
    }
    else if(sent_or_received === 'sent'){
        if(status_arr.includes(status)){
            proc_result = await Model.call_procedure('active_reg_posts_sent', params);
        }
        else{
            proc_result = await Model.call_procedure('completed_reg_posts_sent', params);
        }
        // proc_result = await Model.call_procedure('sent_reg_posts_by_status', params);
    }
    // console.log(proc_result);
    if(proc_result.query_error){
        return {output: null, error: proc_result.query_error.message};
    }
    else{
        let result_arr = [];
        let result = {};
        console.log('else statement');
        // let status_arr = ['on-route-receiver', 'receiver-unavailable', 'on-route-sender', 'sender-unavailable'];
        console.log(proc_result.query_output[0]);
        reg_posts = proc_result.query_output[0];

        for (const reg_post of reg_posts) {
            console.log('inside for of loop');
            let rp_arr = [];
            rp_arr.push(reg_post.id);
            rp_arr.push(`${reg_post.speed_post}`);
            
            // rp_obj.receiver_name = reg_post.receiver_name;
            let receiver_obj = await Address.get_address(reg_post.receiver_id);
            // console.log(receiver_obj);
            if(receiver_obj.error){
                result.error = receiver_obj.error;
                return
            }
            else{
                let rec_address = '';
                rec_address += receiver_obj.output.number + ', ';
                rec_address += ((receiver_obj.output.street != null) ? receiver_obj.output.street+', ' : '');
                rec_address += ((receiver_obj.output.sub_area != null) ? receiver_obj.output.sub_area+', ' : '');
                rec_address += receiver_obj.output.postal_area + ', ';
                rec_address += receiver_obj.output.postal_code;
                rp_arr.push([reg_post.receiver_name, rec_address]);
            }

            // rp_obj.sender_name = reg_post.sender_name;
            let sender_obj = await Address.get_address(reg_post.sender_id);
            // console.log(sender_obj);
            if(sender_obj.error){
                result.error = sender_obj.error;
                return
            }
            else{
                let sen_address = '';
                sen_address += sender_obj.output.number + ', ';
                sen_address += ((sender_obj.output.street != null) ? sender_obj.output.street+', ' : '');
                sen_address += ((sender_obj.output.sub_area != null) ? sender_obj.output.sub_area+', ' : '');
                sen_address += sender_obj.output.postal_area + ', ';
                sen_address += sender_obj.output.postal_code;
                rp_arr.push([reg_post.sender_name, sen_address]);
            }
            
            if(status_arr.includes(status)){
                rp_arr.push(`${reg_post.current_area}, ${reg_post.current_code}`);
                rp_arr.push(dt_local(reg_post.last_update));
            }

            if(['delivered', 'sent-back'].includes(status)){
                rp_arr.push(dt_local(reg_post.delivered_datetime));
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

function dt_local(dtISO){
    let dt = new Date(dtISO);
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;
    return dt_str;
}

module.exports = {
    get_reg_posts
}