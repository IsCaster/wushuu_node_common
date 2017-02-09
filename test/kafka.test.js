var kafka = require('../lib/kafka/producer');

describe('[ DAO/kafka ]', function() {
    it('product message', function(done) {
        var topic = 'regist-ap';
        var msg = 'test_message';
        var hosts = 'kafka';
        kafka.send(hosts, topic, msg).then(function(msg) {
            console.log("kafka product message, message=" + msg)
            done()
        }).catch(function(err) {
            console.error('kafka product message, err=' + err.stack || err)
            done(err)
        })
    })

    it('product error message', function(done) {
        var topic = '';
        var msg = 'test_error_message';
        var hosts = 'kafka';
        kafka.send(hosts, topic, msg).then(function(msg) {
            console.log("kafka product message, message=" + msg)
            done()
        }).catch(function(err) {
            console.error('kafka product message, err=' + err.stack || err)
            done()
        })
    })
})