function dt_local(dtISO){
    let dt = new Date(dtISO);
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;
    return dt_str;
}

function current_dt_str(){
    let dt = new Date();
    let date = dt.toLocaleDateString().split('/');
    let time = dt.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;
    return dt_str;
}

function get_dt_str(dt_obj){
    let date = dt_obj.toLocaleDateString().split('/');
    let time = dt_obj.toTimeString().split(' ');
    let dt_str = `${date[2]}-${date[0]}-${date[1]} ${time[0]}`;
    return dt_str;
}

function get_address_array(address_obj, name = null){
    let address_arr = [];
    (name) && address_arr.push(name);
    address_arr.push(address_obj.number);
    (address_obj.street) && address_arr.push(address_obj.street);
    (address_obj.sub_area) && address_arr.push(address_obj.sub_area);
    address_arr = address_arr.concat([address_obj.postal_area, address_obj.postal_code]);
    return address_arr;
}

function get_address_str(address_obj){
    let address_str = `${address_obj.number}, `;    
    address_str += ((address_obj.street) ? `${address_obj.street}, ` : ``);
    address_str += ((address_obj.sub_area) ? `${address_obj.sub_area}, ` : ``);
    address_str += `${address_obj.postal_area}, ${address_obj.postal_code}`;
    return address_str;
}

function format_status(status){
    let result;
    switch (status) {
        case 'on-route-receiver':
            result = 'On route to Receiver';
            break;
        case 'receiver-unavailable':
            result = "At Receiver's post office. Attempting to deliver to Receiver";
            break;
        case 'delivered':
            result = 'Delivered to Receiver';
            break;
        case 'on-route-sender':
            result = 'RETURN - On route back to Sender';
            break;
        case 'sender-unavailable':
            result = `At Sender's post office. Attempting to return to Sender`;
            break;
        case 'sent-back':
            result = 'Returned to Sender';
            break;
        case 'failed':
            result = 'Failed to deliver or return';
            break;
        default:
            break;
    }
    return result;
}

function validate_currency(price){
    const pattern = /^(?=.*[1-9])\d{1,4}(?:\.\d{2})$/;       // pattern of float with 2 decimal points
    let is_currency = pattern.test(price);
    let price_check = (price === '0.00' || price === '0' || is_currency);
    return price_check;
}

function validate_id_name(input){
    let id_check = (input.hasOwnProperty('id')) && /^\d+$/.test(input.id);
    let name_pattern = /^(?=.*[A-Za-z])[A-Za-z\-,.\s]{1,50}$/;
    let name_check = (input.hasOwnProperty('name')) && (![null, undefined].includes(input.name)) && name_pattern.test(input.name);
    return (id_check && name_check);
}

function validate_number_postal_area(input){
    // input = { number: '121/B', postal_area: 'moratuwa,10400' }
    let number_pattern = /^(?=.*[A-Za-z0-9])[A-Za-z\d\-/,\\]{1,50}$/;
    let number_check = input.hasOwnProperty('number') && (![null, undefined].includes(input.number)) && number_pattern.test(input.number);
    let code_check = false;
    if (input.hasOwnProperty('postal_area') && ![null, undefined].includes(input.postal_area)){
        let pa_arr = input.postal_area.split(',');        
        code_check = (pa_arr.length == 2) && /^\d{5}$/.test(pa_arr[1]);
    }
    return number_check && code_check;
}

function validate_number_postal_code(input){
    // input = { number: '121/B', postal_code: '10400' }
    let number_pattern = /^(?=.*[A-Za-z0-9])[A-Za-z\d\-/,\\]{1,50}$/;
    let number_check = input.hasOwnProperty('number') && (![null, undefined].includes(input.number)) && number_pattern.test(input.number);
    let code_check = input.hasOwnProperty('postal_code') && /^\d{5}$/.test(input.postal_code);
    return number_check && code_check;
}

function validate_address(address){
    // address = {number: 121/B, street: Temple Rd., sub_area: Rawathawatta, postal_code: 10400}
    let special_arr = [null, undefined, true, false];
    let num_pattern = /^(?=.*[A-Za-z0-9])[A-Za-z\d\-/,\\]{1,50}$/;
    let number_check = address.hasOwnProperty('number') && !special_arr.includes(address.number) && num_pattern.test(address.number);
    
    let pattern = /^(?=.*[A-Za-z])[A-Za-z\d\-/()\\.,\s]{1,50}$/;
    let street_check = address.hasOwnProperty('street') && !special_arr.includes(address.street) 
        && (pattern.test(address.street) || address.street.trim() === '');
    let sub_area_check = address.hasOwnProperty('sub_area') && !special_arr.includes(address.sub_area) 
        && (pattern.test(address.sub_area) || address.sub_area.trim() === '');
    
    let code_check = address.hasOwnProperty('postal_code') && /^\d{5}$/.test(address.postal_code);
    // if (address.hasOwnProperty('postal_area') && (typeof address.postal_area === 'string')){
    //     let pa_arr = address.postal_area.split(',');        
    //     code_check = (pa_arr.length == 2) && /^\d{5}$/.test(pa_arr[1]);
    // }
    return number_check && street_check && sub_area_check && code_check;
}

function validate_resident_key(input){
    let resident_key_check = false;
    if(input.hasOwnProperty('resident_key') && (typeof input.resident_key === 'string')){
        let resident_key_length = input.resident_key.trim().length;
        resident_key_check = (resident_key_length > 0) && (resident_key_length < 21);
    }
    return resident_key_check;
}

function validate_money_order(body){
    let body_length = Object.keys(body).length;
    
    let name_pattern = /^(?=.*[A-Za-z])[A-Za-z\-,.\s]{1,50}$/;
    let sen_name_check = body.hasOwnProperty('sender_name') && (typeof body.sender_name === 'string')
        && name_pattern.test(body.sender_name);
    let rec_name_check = body.hasOwnProperty('receiver_name') && (typeof body.receiver_name === 'string')
        && name_pattern.test(body.receiver_name);
    
    let code_check = body.hasOwnProperty('receiver_postal_code') && /^\d{5}$/.test(body.receiver_postal_code);
    let amount_check = body.hasOwnProperty('amount') && /^(?=.*[1-9])\d{1,5}(?:\.\d{2})$/.test(body.amount)
        && parseFloat(body.amount) <= 50000;
    let price_check = body.hasOwnProperty('price') && validate_currency(body.price);

    let expire_check = body.hasOwnProperty('expire_after') && /^\d{1,2}$/.test(body.expire_after)
        && parseInt(body.expire_after) > 0 && parseInt(body.expire_after) < 25;
    
    let po_check = body.hasOwnProperty('posted_location') && /^\d{5}$/.test(body.posted_location);

    let is_valid = (body_length === 7) && sen_name_check && rec_name_check && code_check
        && amount_check && price_check && po_check && expire_check;
    return is_valid;
}

function validate_datetime(date, time){
    // date format = 2020-06-02     time format = 02:07 (24 hour)
    let date_check = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/.test(date);
    let time_check = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    if(!date_check || !time_check){
        return [false, 'Invalid date time format'];
    }
    let dt_str = `${date} ${time}`;
    let timestamp = (new Date(dt_str)).getTime();
    console.log(timestamp);
    if (!timestamp) {
        return [false, 'Inavlid date'];
    }
    let dt_now = new Date();
    if (dt_now.getTime() < timestamp) {
        return [false, 'Future Date Time values are not allowed'];
    }
    return [true];
}

function expiration_check(posted_dt_iso, expire_after){
    let now = new Date();
    let posted_dt = dt_local(posted_dt_iso);
    let expired_dt = new Date(posted_dt);
    expired_dt.setMonth(expired_dt.getMonth() + expire_after);
    let is_expired = now.getTime() >= expired_dt.getTime();
    return [is_expired, get_dt_str(expired_dt)];
}

module.exports = {
    current_dt_str,
    dt_local,
    get_dt_str,
    get_address_array,
    get_address_str,
    format_status,
    validate_currency,
    validate_id_name,
    validate_number_postal_area,
    validate_number_postal_code,
    validate_address,
    validate_resident_key,
    validate_money_order,
    validate_datetime,
    expiration_check
}