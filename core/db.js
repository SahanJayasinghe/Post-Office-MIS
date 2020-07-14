const mysql = require('mysql');
const config = require('config');
const logger = require('./logger');
const debug = require('debug')('po_mis:db');

const db_name = config.get('db');
const db_config = {
    host: config.get('db_host'),
    user: config.get('db_user'),
    password: config.get('db_password'),
    database: db_name,
    timezone: '+05:30'
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
        console.log('db connection down', err);
        logger.error('db connection down', err);
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

function transaction(query_list){    
    return new Promise((resolve, reject) => {
        connection.beginTransaction(function(err) {
            if (err) { return reject(err); }

            let results = [];
            connection.query(query_list[0].statement, query_list[0].params, function (error, resultQ) {
                if (error) {
                    return connection.rollback(function() {
                        // console.log(error);
                        reject(error);
                    });
                }
                results.push(resultQ);
                console.log("1st query completed");
                // console.log(results);

                connection.query(query_list[1].statement, query_list[1].params, function (error, resultQ) {
                    if (error) {
                        return connection.rollback(function() {
                            // console.log(error);
                            reject(error);
                        });
                    }
                    results.push(resultQ);
                    console.log("2nd query completed");
                    // console.log(results);
                    
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                reject(err);
                            });
                        }
                        // console.log('success!');
                        resolve(results);
                    });
                });
            });
        });
    })
}

// return new Promise((resolve, reject) => {
//     let results = [];

//     connection.beginTransaction((trans_err) => {
//         if(trans_err){
//             reject(trans_err);
//         }
        
//         for (const query of query_list) {
//             console.log(query.statement);
//             console.log(query.params);
//             connection.query(query.statement, query.params, (err, resultQ) => {
//                 if(err){
//                     console.log(err);
//                     connection.rollback((rollback_err) => {
//                         reject(rollback_err);
//                     })
//                 }
//                 results.push(resultQ);
//             })
//         }

//         connection.commit((commit_err) => {
//             if(commit_err){
//                 reject(commit_err);
//             }
//             resolve(results);
//         })
//     })
// })

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
    transaction,
    connect,
    disconnect
};