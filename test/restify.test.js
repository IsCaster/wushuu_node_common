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
var before_hander
var after_hander
var ctx
var TestTable
var modelConfigJson = require("../lib/conf/model.conf.example.json")
var pg_conf = {
    'host': 'WUSHUU-PG',
    'port': 5432,
    'user': 'wushuu',
    'pass': 'woyoadmin',
    'db': 'adsweb'
}
var pg_conn_str = "postgres://" + pg_conf.user + ":" + pg_conf.pass + "@" + pg_conf.host + "/" + pg_conf.db;

describe('test restify', function() {
    before('init db', function(done) {
        co(function*() {
            var exportName = "test_rest_table"
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
                }],
                "set": false,
                "PG": true,
                "timestamp": true
            }

            yield model_module.init(modelConfigJson, pg_conn_str)
            yield model_module.registerModel(exportName, conf)
            pgsqlConf.getTables().should.have.property(exportName)
            TestTable = pgsqlConf.getTables()[exportName]
            var newEntry = {
                "owner": "10001",
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
            var list = db_op.list_gen(exportName, exportName, before_hander, after_hander)
            var count = db_op.count_gen(exportName, exportName, before_hander)
            ctx = {
                express: app
            }
            list(ctx)
            count(ctx)
            done()
        }).catch(function(err) {
            console.log('./test/restify.test.js() err:' + err.stack)
        })
    })

    it('# get list', function(done) {
        request(ctx.express).get('/test_table/list')
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
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('# get distinct', function(done) {
        request(ctx.express).get('/test_table/list')
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
                    assert.equal(1, msg.code)
                    assert.equal('10001', msg.data.owner)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('# get count api', function(done) {
        request(ctx.express).get('/test_table/count')
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