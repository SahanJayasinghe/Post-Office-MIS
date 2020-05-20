DB = require('./db');

// class Model {    

    // static connect(){
    //     this.db_ins = DB;
    //     this.db_ins.connect();
    // }

function select(table, fields, conditions = null, params = null){
    // DB.connect();
    // console.log(this.db_ins);
    // console.log(conditions);
    // console.log(params);
    let sql = '';
    if(conditions != null){
        sql = `SELECT ${fields} FROM ${table} WHERE ${conditions}`;
    }
    else{
        sql = `SELECT ${fields} FROM ${table}`;
    }        
    console.log(sql);
    // let result = {};
    // exec_query(db_con, sql, params, callback);
    return DB.query(sql, params);

    // if(result.err){
    //     console.log(result.err.message);
    // }
    // else{
    //     console.log('query successful');
    //     console.log(result.output);
    // }
    // console.log('select function model.js');

    // console.log(result);
    // return result;    
}

function insert(table, insert_obj){   
    // DB.connect(); 
    // let field_string = fields.toString();
    let sql = `INSERT INTO ${table} SET ?`;
    console.log(sql);
    // console.log(values);
    return DB.query(sql, insert_obj);    
}

function update(table, update_str, conditions, params){
    // DB.connect();
    let sql = `UPDATE ${table} SET ${update_str} WHERE ${conditions}`;
    console.log(sql);
    return DB.query(sql, params);
}

function remove(table, condition, params){
    // DB.connect();
    let sql = `DELETE FROM ${table} WHERE ${condition}`;
    console.log(sql);
    return this.db_ins.query(sql, params);
}

function call_procedure(proc_name, params){
    // params is a string or an array
    let temp = [];
    let temp_str = '?';
    if(typeof params != 'string'){
        params.forEach(element => {
            temp.push('?');
        });
        temp_str = temp.join(',');
    }
    let sql = `CALL ${proc_name}(${temp_str})`;
    console.log(sql);
    return DB.query(sql, params);
    
}
// }

module.exports = {
    select, insert, update, remove, call_procedure
};

