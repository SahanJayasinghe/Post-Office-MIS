const Model = require('../../core/Model');
const helper = require('../../core/helper');
const Address = require('./Address');
const { dt_local } = require('../../core/helper');

async function create_parcel_post(receiver, payment, descript, post_office){
    // receiver = {id: 2, name: 'Kamal'}
    // payment = 120.50
    // post_office = 10400
    let dt_str = helper.current_dt_str();

    let insert_obj = {
        receiver_id: receiver.id,
        receiver_name: receiver.name,
        payment: payment,
        status: 'on-route-receiver',
        current_location: post_office,
        last_update: dt_str,
        posted_location: post_office,
        posted_datetime: dt_str
    }
    let description = descript.trim();
    if(description !== ''){
        insert_obj.description = description;
    }
    console.log(insert_obj);
    let insert_result = await Model.insert('parcels', insert_obj);
    if(insert_result.query_error){
        return {output: null, error: insert_result.query_error.message};
    }
    return {output: insert_result.query_output, error: null};
}

async function update_location(parcel_id, post_office){

    let parcel_result = await Model.select('parcels', 'status, current_location', 'id = ?', parcel_id);
    console.log(parcel_result);
    if(parcel_result.query_error){
        return {output: null, error: parcel_result.query_error.message};
    }
    else if(!parcel_result.query_output.length){
        return {output: null, error: 'Parcel id does not exist'};
    }
    else if(parcel_result.query_output[0].status != 'on-route-receiver'){
        return {output: null, error: 'Parcel has already reached the destination post office'};
    }
    else if(parcel_result.query_output[0].current_location == post_office){
        return {output: null, error: 'Parcel location is already updated'};
    }
    else{
        let dt_str = helper.current_dt_str();

        let update_query = {
            statement: `UPDATE parcels SET current_location = ?, last_update = ? WHERE id = ?`,
            params: [post_office, dt_str, parcel_id]
        };

        let insert_query = {
            statement: `INSERT INTO parcels_route_info SET ?`,
            params: {parcel_id, location: post_office, updated_at: dt_str}
        };

        // let update_str = 'current_location = ?, last_update = ?';
        // let params = [post_office, dt_str, parcel_id];
        // console.log(params);
        // let update_result = await Model.update('parcels', update_str, 'id = ?', params);
        // console.log(update_result);
        // if(update_result.query_error){
        //     return {output: null, error: update_result.query_error.message};
        // }
        let trans_result = await Model.execute_transaction([update_query, insert_query]);
        console.log(trans_result);
        return {output: {last_location: post_office, last_update: dt_str}, error: null};
    }
}

async function discard_parcel(parcel_id, post_office){
    let columns = 'current_location, status, delivery_attempts';
    let parcel_result = await Model.select('parcels', columns, 'id = ?', parcel_id);
    if(parcel_result.query_error){
        return {output: null, error: parcel_result.query_error.message};
    }
    else if(!parcel_result.query_output.length){
        return {output: null, error: 'Parcel id does not exist'};
    }
    
    let {status, current_location, delivery_attempts} = parcel_result.query_output[0];
    if (status === 'receiver-unavailable' && delivery_attempts > 0 && current_location === post_office){
        let dt_str = helper.current_dt_str();    
        let update_str = 'status = ?, last_update = ?';
        let params = ['failed', dt_str, parcel_id];
        let update_result = await Model.update('parcels', update_str, 'id = ?', params);
        console.log(update_result);
        if(update_result.query_error){
            return {output: null, error: update_result.query_error.message};
        }
        return {output: {status: 'failed', last_update: dt_str}, error: null};
    }
    else{
        let msg = '';
        if(status !== 'receiver-unavailable'){
            msg += 'Not allowed to discard this parcel. ';
        }
        if (post_office !== current_location){
            msg += `Only the Post Office ${current_location} has the authority to discard this parcel.`;
        }
        return {output: null, error: msg}
    }
}

async function get_parcel(parcel_id){
    let parcel_result = await Model.select('parcels', '*', 'id = ?', parcel_id);
    console.log(parcel_result);

    if(parcel_result.query_error){
        return {output: null, error: parcel_result.query_error.message};
    }
    else if(!parcel_result.query_output.length){
        return {output: null, error: 'Parcel id does not exist'};
    }

    let receiver = await Address.get_address_by_id(parcel_result.query_output[0].receiver_id);
    console.log(receiver);
    if(receiver.error){
        return receiver;
    }

    // let rec = receiver.output;
    // let rec_arr = [parcel_result.query_output[0].receiver_name, rec.number];
    // (rec.street) && rec_arr.push(rec.street);
    // (rec.sub_area) && rec_arr.push(rec.sub_area);
    // rec_arr = rec_arr.concat([rec.postal_area, rec.postal_code]);

    let rec_arr = helper.get_address_array(receiver.output, parcel_result.query_output[0].receiver_name);

    let cur_loc;
    let posted_loc;
    let params = [parcel_result.query_output[0].current_location, parcel_result.query_output[0].posted_location];
    let PA_result = await Model.select('postal_areas', 'code, name', 'code = ? OR code = ?', params);
    if(PA_result.query_error){
        return {output: null, error: PA_result.query_error.message};
    }
    else if(PA_result.query_output.length == 2){
        if(PA_result.query_output[0].code == params[0]){
            cur_loc = `${PA_result.query_output[0].name},${PA_result.query_output[0].code}`;
            posted_loc = `${PA_result.query_output[1].name},${PA_result.query_output[1].code}`;
        }
        else{
            cur_loc = `${PA_result.query_output[1].name},${PA_result.query_output[1].code}`;
            posted_loc = `${PA_result.query_output[0].name},${PA_result.query_output[0].code}`;
        }
    }
    else{
        cur_loc = `${PA_result.query_output[0].name},${PA_result.query_output[0].code}`;
        posted_loc = cur_loc;
    }
    let delivered_datetime = (parcel_result.query_output[0].delivered_datetime)
        ? helper.dt_local(parcel_result.query_output[0].delivered_datetime)
        : null;

    let parcel_obj = {
        id: parcel_id,
        receiver: rec_arr,
        payment: parcel_result.query_output[0].payment,
        status: parcel_result.query_output[0].status,
        current_location: cur_loc,
        last_update: helper.dt_local(parcel_result.query_output[0].last_update),
        posted_location: posted_loc,
        posted_dt: helper.dt_local(parcel_result.query_output[0].posted_datetime),
        delivery_attempts: parcel_result.query_output[0].delivery_attempts,
        delivered_dt: delivered_datetime
    };
    return {output: parcel_obj, error: null};
}

async function get_route_info(id){
    let route_info = await Model.call_procedure('parcel_route', id);
    let route_info_len = route_info.query_output[0].length;
    let route_list = [];
    for (let i = 0; i < route_info_len; i++) {
        const record = route_info.query_output[0][i];
        route_list.push([record.name, record.code, dt_local(record.updated_at)]);        
    }
    return {output: route_list, error: null}
}

async function get_resident_parcels_by_status(resident_id, status){
    // status = 'delivering' | 'delivered' | 'failed'
    let proc_result;
    (status == 'delivering') 
        ? proc_result = await Model.call_procedure('resident_active_parcels', resident_id)
        : proc_result = await Model.call_procedure('resident_completed_parcels', [resident_id, status]);
    
    if(proc_result.query_error){
        return {output: null, error: proc_result.query_error.message};
    }

    let result = {};
    let result_arr = [];

    console.log(proc_result.query_output[0]);
    parcels = proc_result.query_output[0];

    for (const parcel of parcels) {
        let parcel_arr = [parcel.id, parcel.receiver_name];
        (parcel.description) ? parcel_arr.push(parcel.description) : parcel_arr.push('_');

        if (status == 'delivering'){
            let pa_result = await Model.select('postal_areas', 'name', 'code = ?', parcel.current_location);
            if(pa_result.query_error){
                result.error = pa_result.query_error;
                return;
            }
            else{
                parcel_arr.push(`${pa_result.query_output[0].name}, ${parcel.current_location}`);
                parcel_arr.push(helper.dt_local(parcel.last_update));
            }
        }

        if(status == 'delivered'){
            parcel_arr.push(helper.dt_local(parcel.delivered_datetime));
        }
        if(status == 'failed'){
            parcel_arr.push(helper.dt_local(parcel.last_update));
        }

        parcel_arr.push(parcel.delivery_attempts);
        let posted_at_arr = [`${parcel.posted_area_name}, ${parcel.posted_area_code}`, helper.dt_local(parcel.posted_datetime)]
        parcel_arr.push(posted_at_arr);
        // parcel_arr.push(helper.dt_local(parcel.posted_datetime));

        result_arr.push(parcel_arr);
    }
    result.output = result_arr;
    console.log(result);
    return result;
}

module.exports = {
    create_parcel_post,
    update_location,
    discard_parcel,
    get_parcel,
    get_route_info,
    get_resident_parcels_by_status
}