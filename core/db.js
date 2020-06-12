const mysql = require('mysql');
const config = require('config');
const debug = require('debug')('po_mis:db');

const db_name = config.get('db');
const db_config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: db_name
};

let connection;

function handleConnection() {
    connection = mysql.createConnection(db_config); 
    // Recreate the connection, since the old one cannot be reused. 
  
    connection.connect((err) => {              
        // The server is either down or restarting (takes a while sometimes).
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleConnection, 5000); 
            // We introduce a delay before attempting to reconnect, to avoid a hot loop,
            //  and to allow our node script to process asynchronous requests in the meantime.
        }
        else{
            console.log(`Connected to database '${db_name}' using threadID ${connection.threadId}`);
        }                                     
    });                                     
                                            
    connection.on('error', (err) => {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
            handleConnection();            
            // Connection to the MySQL server is usually lost due to either server restart, or a
            // connnection idle timeout (the wait_timeout server variable configures this)
        }
        else {                           
            throw err;
        }
    });
}  

function connect(){
    connection = mysql.createConnection(db_config);

    connection.connect((err) => {
        if (err) {
            console.error('error connecting: ' + err.message);
            return;
        }
        debug(`Connected to database '${db_name}' using threadID ${connection.threadId}`);
    });        
}

function query(sql, args){
    return new Promise((resolve, reject) => {
        connection.query(sql, args, (err, resultQ) => {
            if (err) {                
                debug('db_file_reject');
                // console.log(err);
                debug(err.sqlState);
                debug(err.sql);
                debug(err.sqlMessage);                
                reject(err);
            }
            else{                
                debug('db_file_resolve');                
                // console.log(resultQ);
                resolve({query_output: resultQ, query_error: null});
            }                
        });
    });
}

function disconnect(){
    return new Promise((resolve, reject) => {
        connection.end( err => {
            if (err)
                return reject(err);
            debug(`closed connection to db ${db_name}`);
            resolve();
        });
    });
}

module.exports = {
    handleConnection,
    query,
    connect,
    disconnect
};