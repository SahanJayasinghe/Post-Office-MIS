
var express = require('express');
var app = express();

var mysql = require('mysql');
var bodyParser = require('body-parser');

app.use(bodyParser.json({type:'application/json'}));
app.use(bodyParser.urlencoded({extended:true}));
	
var con = mysql.createConnection({
	host:'localhost',
	user: 'root',
	password: '',
	database: 'post_office_mis'
});
	
var server = app.listen(4545, function(){
	var host = server.address().address
	var port = server.address().port
	console.log('server started')
});


con.connect(function(error){
	if(!!error) console.log('error');
	else console.log('connected to server');
});


app.get('/users/:id', function(req, res){
	con.query('SELECT * from registered_posts WHERE id = ?', req.params.id, function(error, rows, fields){
		if(!!error) console.log('error');
		else{
			console.log(rows);
			res.send(JSON.stringify(rows));  
		}
			
	});
})


app.put('/users', function(req, res){
	con.query('UPDATE registered_posts set status="delivered"  WHERE id=?',[req.body.id ], function(error, rows,fields){
		if(error) throw error;
			console.log(rows);
			res.end(JSON.stringify(rows));
				
	})
})