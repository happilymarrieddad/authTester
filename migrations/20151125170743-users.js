var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {
	async.series([
		db.createTable.bind(db,'users', {
			id: { type: "int", primaryKey:true, autoIncrement: true, notNull: true },
			first: { type: "string", length:100 },
			last: { type: "string", length:100 },
			email: { type: "string", length:100 },
			password: { type: "string", length:100 },
			type_id: { type: "int", length:11 }
		}),
		db.insert.bind(db,'users', [ "first","last","email","password","type_id" ], [ "Nick","Kotenberg","nick@mail.com","5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",1 ]),
		db.insert.bind(db,'users', [ "first","last","email","password","type_id" ], [ "John","Smith","john@mail.com","5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",2 ])
	], callback);
};

exports.down = function(db, callback) {
  db.dropTable('users', callback);
};