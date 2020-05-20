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
    let name_check = (input.hasOwnProperty('name')) && /^[A-Za-z.\s]+$/.test(input.name);
    return (id_check && name_check);
}

function validate_number_postal_area(input){
    // input = { number: 121/B, postal_area: 'moratuwa,10400' }
    let number_check = input.hasOwnProperty('number') && /^[A-Za-z0-9,-/\\]+$/.test(input.number);
    let code_check = false;
    if (input.hasOwnProperty('postal_area')){
        let pa_arr = input.postal_area.split(',');        
        code_check = (pa_arr.length == 2) && /^\d{5}$/.test(pa_arr[1]);
    }
    return number_check && code_check;
}

module.exports = {
    current_dt_str,
    dt_local,
    get_address_array,
    get_address_str,
    format_status,
    validate_currency,
    validate_id_name,
    validate_number_postal_area
}