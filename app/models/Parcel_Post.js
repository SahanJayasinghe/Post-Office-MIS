const Model = require('../../core/Model');
const helper = require('../../core/helper');
const Address = require('./Address');

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
    if(descript != ''){
        insert_obj.description = descript;
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

        let update_str = 'current_location = ?, last_update = ?';
        let params = [post_office, dt_str, parcel_id];
        console.log(params);
        let update_result = await Model.update('parcels', update_str, 'id = ?', params);
        console.log(update_result);
        if(update_result.query_error){
            return {output: null, error: update_result.query_error.message};
        }
        return {output: {last_location: post_office, last_update: dt_str}, error: null};
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
    let reached_receiver_po = (parcel_result.query_output[0].reached_receiver_po) 
                                ? helper.dt_local(parcel_result.query_output[0].reached_receiver_po)
                                : null;
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
        reached_receiver_po: reached_receiver_po,
        delivery_attempts: parcel_result.query_output[0].delivery_attempts,
        delivered_dt: delivered_datetime
    };
    return {output: parcel_obj, error: null};
}

module.exports = {
    create_parcel_post,
    update_location,
    get_parcel
}