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

function errHandlerGen(producer, reject) {
	return err => {
		b_kafka_valid = false
		reject(err)
		producer.close()
	}
}

var initial_kafka = function(host) {
	return new Promise(function(resolve, reject) {
		client = new Client(host);
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
			producerKeyed.on('error', errHandlerGen(producerKeyed, reject))
		})

		producer.on('error', errHandlerGen(producer, reject))
	})
}

var send = function(host, topic, msg, p) {
	return co(function*() {
		if (p == undefined) {
			p = 0
		}
		if (!b_kafka_valid) {

			yield initial_kafka(host).catch(function(err) {
				b_kafka_valid = false
				return Promise.reject(err)
			})
			console.log('kafka.send() init kafka, done')

		}
		//var producer = Promise.promisifyAll(producer)
		//var message = yield producer.sendAsync([{ topic: topic, messages: msg}])
		var message = yield new Promise(function(resolve, reject) {
			producer.send([{
				topic: topic,
				messages: msg,
				partitions: p
			}], function(err, message) {
				if (err) {
					producer.close();
					reject(err)
				} else {
					resolve(message)
				}

			})
		})

	})
}

exports.initial_kafka = initial_kafka
exports.send = send