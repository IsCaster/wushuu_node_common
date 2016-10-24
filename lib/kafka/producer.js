var kafka = require('kafka-node')
var co = require('co')
var Producer = kafka.Producer;
var Client = kafka.Client;
var KeyedMessage = kafka.KeyedMessage;
var client, producer, noAckProducer, producerKeyed;
producer = null
	//var old_producters=[]

//exports.flag = 1;

var b_kafka_valid = false

var initial_kafka = function() {
	return new Promise(function(resolve, reject) {
		client = new Client('WUSHUU-LOCAL-KAFKA');
		/*if(producer!==null)
		{
			old_producters.push(producer)
		}
		if(producerKeyed!==null)
		{
			old_producters.push(producerKeyed)
		}*/
		producer = new Producer(client, {
			ackTimeoutMs: 3000
		});
		//noAckProducer = new Producer(client, { requireAcks: 0,ackTimeoutMs: 100 });
		producerKeyed = new Producer(client, {
			ackTimeoutMs: 3000,
			partitionerType: Producer.PARTITIONER_TYPES.keyed
		});

		console.log('waiting producer ready')

		producer.on('ready', function() {
			producerKeyed.on('ready', function() {
				b_kafka_valid = true
				console.log('producer is ready')
				resolve();
			})
			producerKeyed.on('error', function(err) {
				b_kafka_valid = false
				console.error("initial_kafka() init producerKeyed error:" + err.stack)
				reject(err)
				producerKeyed.close()
			})
		})

		producer.on('error', function(err) {
			b_kafka_valid = false
			console.error("initial_kafka() init producer error:" + err.stack)
			reject(err)
			producer.close()
		})
	})
}

var send = function(hosts, topic, msg) {
	return co(function*() {

		if (!b_kafka_valid) {
			console.log('kafka.send() yield init kafka')

			yield initial_kafka().catch(function(err) {
				console.error('initial_kafka() failed,err =  ' + err.stack)
				b_kafka_valid = false
				return Promise.reject(err)
			})
		}
		console.log('kafka.send() kafka is ok')
			//var producer = Promise.promisifyAll(producer)
			//var message = yield producer.sendAsync([{ topic: topic, messages: msg}])
		var message = yield new Promise(function(resolve, reject) {
			producer.send([{
				topic: topic,
				messages: msg
			}], function(err, message) {
				if (err) {
					console.error('kafka.send() err = ' + err.stack)
					producer.close();
					reject(err)
				} else {
					console.log('./DAO/kafka/producer.js-send():kafka send message=' + msg);
					resolve(message)
				}

			})
		})

	})
}

exports.initial_kafka = initial_kafka
exports.send = send