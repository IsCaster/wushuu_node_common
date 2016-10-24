var kafka = require('../lib/kafka/producer');

describe('[ DAO/kafka ]', function() {
    var topic = 'regist-ap';
    var msg = 'test_message';
    var hosts = 'WUSHUU-LOCAL-KAFKA';
    it('product message', function(done) {
        kafka.send(hosts, topic, msg).then(function(msg) {
            console.log("kafka product message, message=" + msg)
            done()
        }).catch(function(err) {
            console.error('kafka product message, err=' + err.stack || err)
            done(err)
        })
    })
})