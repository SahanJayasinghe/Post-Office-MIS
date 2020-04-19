var mysql = require('mysql');

class DB{

    static connect(){
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'post_office_mis'
        });

        this.connection.connect((err) => {
            if (err) {
              console.error('error connecting: ' + err.message);
              return;
            }
            console.log(`Connected to database using threadID ${this.connection.threadId}`);
        });        
    }

    static query(sql, args){
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, resultQ) => {
                if (err)
                    return reject({query_output: null, query_error: err});
                resolve({query_output: resultQ, query_error: null});
            });
        });
    }

    static disconnect(){
        return new Promise((resolve, reject) => {
            this.connection.end( err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }      
}

module.exports = DB;