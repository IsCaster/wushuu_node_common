var express = require('express')
var co = require('co')
var model_module = require('../lib/Model');
var db_module = require('../lib/db');
var db_op = require('../lib/restify')
var request = require('supertest')
var assert = require('assert')
var orm = require('orm')
var check_response = require('../lib/utils').check_response;
var before_hander
var after_hander
var ctx
var modelConfigJson = require("../lib/conf/model.conf.example.json")
var pg_conf = {
    'host': 'WUSHUU-PG',
    'port': 5432,
    'user': 'wushuu',
    'pass': 'woyoadmin',
    'db': 'adsweb'
}
var pg_conn_str = "postgres://" + pg_conf.user + ":" + pg_conf.pass + "@" + pg_conf.host + "/" + pg_conf.db;

describe('test common_db_op_test', function() {
    before('init db', function(done) {
        co(function*() {
            yield model_module.init(modelConfigJson, pg_conn_str)
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
            var list = db_op.list_gen('ap_v2', 'test', before_hander, after_hander)
            var count = db_op.count_gen('ap_v2', 'test', before_hander)
            ctx = {
                express: app
            }
            list(ctx)
            count(ctx)
            done()
        })
    })

    it('# get list', function(done) {
        request(ctx.express).get('/test/list')
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
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('# get distinct', function(done) {
        request(ctx.express).get('/test/list')
            .query({
                filter: {
                    distinct: {
                        code: ""
                    }
                }
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(1, msg.code)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })

    it('# get count api', function(done) {
        request(ctx.express).get('/test/count')
            .query({
                or: [{
                    owner: orm.not_like('%' + '123' + '%')
                }],
            })
            .expect(200)
            .end(function(err, res) {
                check_response(err, res.text).then(function(msg) {
                    assert.equal(1, msg.code)
                    done()
                }).catch(function(err) {
                    done(err)
                })
            })
    })
})