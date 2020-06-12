const debug = require('debug')('po_mis:db');
const DB = require('./db');

function select(table, fields, conditions = null, params = null){
    // console.log(conditions);
    // console.log(params);
    let sql = '';
    if(conditions != null){
        sql = `SELECT ${fields} FROM ${table} WHERE ${conditions}`;
    }
    else{
        sql = `SELECT ${fields} FROM ${table}`;
    }        
    debug(sql);
    return DB.query(sql, params); 
}

function insert(table, insert_obj){
    let sql = `INSERT INTO ${table} SET ?`;
    debug(sql);
    return DB.query(sql, insert_obj);    
}

function update(table, update_str, conditions, params){
    let sql = `UPDATE ${table} SET ${update_str} WHERE ${conditions}`;
    debug(sql);
    return DB.query(sql, params);
}

function remove(table, condition, params){
    let sql = `DELETE FROM ${table} WHERE ${condition}`;
    debug(sql);
    return DB.query(sql, params);
}

function call_procedure(proc_name, params){
    // params is a string, number or an array
    let temp = [];
    let temp_str = '?';
    if ( !['string', 'number'].includes(typeof params) ) {
        params.forEach(element => {
            temp.push('?');
        });
        temp_str = temp.join(',');
    }
    let sql = `CALL ${proc_name}(${temp_str})`;
    debug(sql);
    return DB.query(sql, params);
}

module.exports = {
    select, insert, update, remove, call_procedure
};