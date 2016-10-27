var express = require('express')
var db_op = require('../lib/restify')
var ctx
describe('test common_db_op_test', function() {
    before('init db', function(done) {
        var app = express()
        ctx = {
            express: app
        }
        done()
    })
    it('# list generation', function(done) {
        var before_hander = function(req, res) {
            return new Promise(function(resolve, reject) {
                console.log('test list_op start')
                resolve()
            })
        }
        var after_hander = function(data) {
            return new Promise(function(resolve, reject) {
                console.log('test list_op ending!')
                resolve(data)
            })
        }
        var list = db_op.list_gen('ap_v2', 'test', before_hander, after_hander)
        list(ctx)
        done()
    })
})