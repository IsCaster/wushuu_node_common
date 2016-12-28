var express = require('express')
var co = require('co')
var model_module = require('../lib/Model');
var db_module = require('../lib/db');
var pgsqlConf = require('../lib/orm/pgsql.db.config')
var db_op = require('../lib/restify')
var request = require('supertest')
var assert = require('assert')
var orm = require('orm')
var should = require('should')
var check_response = require('../lib/utils').check_response;
var bodyParser = require('body-parser')
var sinon = require('sinon')
var before_hander
var after_hander
var ctx
var TestTable
var modelConfigJson = require("../lib/conf/model.conf.example.json")
var pg_conf = {
    'host': 'CITIC-SERVER',
    'port': 15432,
    'user': 'wushuu',
    'pass': 'woyoadmin',
    'db': 'citic'
}
var pg_conn_str = "postgres://" + pg_conf.user + ":" + pg_conf.pass + "@" + pg_conf.host + ":" + pg_conf.port + "/" + pg_conf.db;
describe('test restify', function() {
    var exportName = "test_rest_table"
    var added_id
    var spy_before
    var spy_after
    before('init db', function(done) {
        co(function*() {
            var conf = {
                "name": "test_rest_table",
                "type": "simple",
                "attr": [{
                    "key": "owner",
                    "default": 0,
                    "type": "int"
                }, {
                    "key": "type",
                    "default": "",
                    "type": "string"
                }, {
                    "key": "change",
                    "default": 0,
                    "type": "double"
                }, {
                    "key": "remark",
                    "default": "",
                    "type": "string"
                }, {
                    "key": "mall_id",
                    "default": 0,
                    "type": "int"
                }, {
                    "key": "transaction_time",
                    "type": "date"
                }, {
                    "key": "checked",
                    "default": 0,
                    "type": "int"
                }, {
                    "key": "code",
                    "default": 0,
                    "type": "float",
                    "size": 4
                }, {
                    "key": "valid",
                    "default": 1,
                    "type": "int",
                }],
                "set": false,
                "PG": true,
                "timestamp": true
            }
            yield model_module.init(modelConfigJson, pg_conn_str, 'redis', {
                "host": "CITIC-SERVER",
                "port": 16379
            })
            yield model_module.registerModel(exportName, conf)
            pgsqlConf.getTables().should.have.property(exportName)
            TestTable = pgsqlConf.getTables()[exportName]
            var newEntry = {
                "owner": 10001,
                "type": "win",
                "change": 999999.9999,
                "transaction_time": new Date()
            }
            yield new Promise((resolve, reject) => {
                TestTable.create(newEntry, err => {
                    if (err !== null)
                        reject(err)
                    else
                        resolve()
                })
            })
            var app = express()
            app.use(bodyParser.json({
                limit: '50mb'
            })); // to support JSON-encoded bodies
            app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
                extended: true,
                limit: '50mb'
            }));
            before_hander = function(req, res) {
                return new Promise(function(resolve, reject) {
                    console.log('test list_op start')
                    resolve()
                })
            }
            after_hander = function(data) {
                return new Promise(function(resolve, reject) {
                    console.log('test list_op ending!')
                    resolve(data)
                })
            }

            spy_before = sinon.spy(before_hander);
            spy_after = sinon.spy(after_hander);
            var list = db_op.list_gen(exportName, exportName, spy_before, spy_after)
            var count = db_op.count_gen(exportName, exportName, spy_before)
            var add = db_op.add_gen(exportName, exportName, spy_before, ['owner', 'change'])
            var update = db_op.update_gen(exportName, exportName, spy_before)
            var del = db_op.del_gen(exportName, exportName, spy_before)
            var get = db_op.get_gen(exportName, exportName, spy_before)
            var invalid = db_op.invalid_gen(exportName, exportName, spy_before)
            ctx = {
                express: app
            }
            list(ctx)
            count(ctx)
            add(ctx)
            update(ctx)
            del(ctx)
            get(ctx)
            invalid(ctx)
            done()
        }).catch(function(err) {
            console.log('./test/restify.test.js() err:' + err.stack)
        })
    })

    it('#add api', function(done) {
        request(ctx.express)
            .post('/' + exportName + '/add')
            .send({
                "owner": 10012,
                "type": "win",
                "change": 999999.9999,
                "transaction_time": new Date()
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    added_id = msg.index
                    assert.equal(1, msg.code)
                    assert.equal('save success', msg.msg)
                    assert.equal(1, spy_before.callCount)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('#update api', function(done) {
        request(ctx.express)
            .post('/' + exportName + '/update')
            .send({
                "id": added_id,
                "owner": 10013,
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(2, spy_before.callCount)
                    assert.equal(1, msg.code)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('#get api', function(done) {
        request(ctx.express)
            .get('/' + exportName + '/get')
            .query({
                "id": added_id
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(3, spy_before.callCount)
                    assert.equal(1, msg.code)
                    assert.equal(10013, msg.value.owner)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('#invalid api', function(done) {
        request(ctx.express)
            .get('/' + exportName + '/invalid')
            .query({
                "id": added_id
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(4, spy_before.callCount)
                    assert.equal(1, msg.code)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('#get api', function(done) {
        request(ctx.express)
            .get('/' + exportName + '/get')
            .query({
                "id": added_id
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(5, spy_before.callCount)
                    assert.equal(1, msg.code)
                    assert.equal(0, msg.value.valid)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })



    it('#remove api', function(done) {
        request(ctx.express)
            .get('/' + exportName + '/remove')
            .query({
                "id": added_id
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(6, spy_before.callCount)
                    assert.equal(1, msg.code)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('# get list', function(done) {
        request(ctx.express).get('/' + exportName + '/list')
            .query({
                page_size: 10,
                or: [{
                    owner: orm.not_like('%' + '123' + '%')
                }],
                filter: {
                    order: 'create_time Z'
                }
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(1, msg.code)
                    assert.equal(1, msg.data.length)
                    assert.equal(7, spy_before.callCount)
                    assert.equal(1, spy_after.callCount)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('# get distinct', function(done) {
        request(ctx.express).get('/' + exportName + '/list')
            .query({
                filter: {
                    distinct: {
                        owner: ""
                    }
                }
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(8, spy_before.callCount)
                    assert.equal(1, msg.code)
                    assert.equal('10001', msg.data.owner)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('# get count api', function(done) {
        request(ctx.express).get('/' + exportName + '/count')
            .query({
                or: [{
                    owner: orm.not_like('%' + '123' + '%')
                }],
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(1, msg.code)
                    assert.equal(1, msg.data)
                    assert.equal(9, spy_before.callCount)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })



    it('# Clear test Table', function(done) {
        TestTable.drop(err => {
            should.not.exist(err)
            done()
        })
    })

})