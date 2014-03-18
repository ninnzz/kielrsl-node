var db
	, pending = []
	, mongoClient = require('mongodb').MongoClient
	, fs = require('fs')
	, config = require(__dirname + "/../config/database").mongodb
	, logger = require(__dirname + "/../lib/logger")
	, importData = function (imports) {
		imports.forEach(function (collectionName) {
			var file = __dirname + '/../data/' + collectionName + '.json',
				collection,
				truncateCollection = function(err, _collection){
					if (err) throw err;
					collection = _collection;
					collection.remove(readFile, function (err) {
						if (err) {
							logger(err.message,'db_debug');
							console.dir(err);
						}
					});
				},
				readFile = function (err, data) {
					if (err) throw err;
					fs.readFile(file, 'utf8', insertData);
				},
				insertData = function (err, data) {
					if (err) throw err;
					data = JSON.parse(data);
					collection.insert(data, function (err) {
						if (err) {
							logger(err.message,'db_debug');
							console.dir(err);
						}
					});
					logger(file + ' import success','db_info');
				};
			if(db){
				db.collection(collectionName, truncateCollection);
			} else {
				console.log('Request put to pending, no connection yet');
				pending.push(function(){
					db.collection(collectionName, truncateCollection);
				});
			}
		});
	};	


mongoClient.connect([
		'mongodb://',
		config.host,
		':',
		config.port,
		'/',
		config.name
	].join(''), {
		server : {
			auto_reconnect: true
		}
	}, function (err, d) {
		if (err) throw err;
		db = d;
		console.log('connected to freedom database');
		logger("Connected to 'freedom' database",'db_log');
	}
);


exports._instance = function()
{
	return db;
}

exports.imports = function(err,d)
{
	if(err) throw err;
	importData(d);
}
