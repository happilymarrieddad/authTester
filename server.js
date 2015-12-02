var SocketCluster = require('socketcluster').SocketCluster;
require('templatizer')(__dirname+'/templates',__dirname+'/public/templates.js');

var socketCluster = new SocketCluster({
	workers: require('os').cpus().length,
	brokers: 1,
	port: 3000,
	appName: 'authTester',
	workerController: __dirname + '/worker.js',
	brokerController: __dirname + '/broker.js',
	socketEventLimit: 100,
	rebootWorkerOnCrash: true,
	logLevel:2,
	protocol:'http'
});