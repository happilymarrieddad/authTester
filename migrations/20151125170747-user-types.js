var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {
	async.series([
		db.createTable.bind(db,'user_types', {
			id: { type: "int", primaryKey:true, autoIncrement: true, notNull: true },
			name: { type: "string", length:100 }
		}),
		db.insert.bind(db,'user_types', [ "name" ], [ "admin" ]),
		db.insert.bind(db,'user_types', [ "name" ], [ "user" ])
	], callback);
};

exports.down = function(db, callback) {
  db.dropTable('user_types', callback);
};