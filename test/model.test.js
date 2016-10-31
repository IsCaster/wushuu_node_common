var should = require('should')
var db_module = require('../lib/db')
var model_module = require('../lib/Model')
var setMDB = require('../lib/db').setMDB
var Model_factory = model_module.Model_factory
var loadConf = model_module.loadConf
var table_operator = require("../lib/orm/pgsql.db.dao").table_operator
var assert = require('assert')
var fs = require('fs')
var co = require('co')
var promisify = require("bluebird").promisify
var modelConfigJson = require("../lib/conf/model.conf.example.json")
var pg_conf = {
    'host': 'WUSHUU-PG',
    'port': 5432,
    'user': 'wushuu',
    'pass': 'woyoadmin',
    'db': 'adsweb'
}
var pg_conn_str = "postgres://" + pg_conf.user + ":" + pg_conf.pass + "@" + pg_conf.host + "/" + pg_conf.db;


var modelTest = mdb => {
    describe('[ DAO/Model (' + mdb + ') ]', function() {
        before(function(done) {
            setMDB(mdb)
            model_module.init(modelConfigJson, pg_conn_str).then(done)
        })
        describe('Model basic', function() {
            it('Add a space', function(done) {
                var op = Model_factory('ad.space').p({
                    'desc': 'test desc',
                    'type': 'test type'
                }).where(1).save(function(result) {
                    console.log("Add a space, save() result=" + JSON.stringify(result))
                    assert.equal(1, result.code);
                    if (result.code) {
                        //get index
                        var index = result.index;
                        op = op.findOne(index, function(result) {
                            assert.equal(1, result.code);
                            op = op.update(index, {
                                'desc': 'update desc',
                                'type': 'update type'
                            }, function(result) {
                                assert.equal(1, result.code)
                                op.findOne(index, function(result) {
                                    assert.equal(1, result.code)
                                    if (result.code) {
                                        assert.equal('update desc', result.value.desc)
                                        assert.equal('update type', result.value.type)
                                    }
                                    done();
                                })
                            })
                        });
                    }
                })
            })
            it('Clear Test', function(done) {
                var op = Model_factory('ad.space').where(1).list().del();
                op.list(function(result) {
                    assert.equal(0, result.value.length)
                    done()
                })
            })
        });
        describe('Model Set basic', function() {
            it('Add a group-space item', function(done) {
                var op = Model_factory('ad.space.group.set').p([1, 2, 3, 4, 5, 6, 7, 8, 9]).where('1:1').save(function(result) {
                    assert.equal(true, op.isOkay(result))
                    if (op.isOkay(result)) {
                        op = op.list(function(result) {
                            assert.equal(1, result.code)
                            op.update(9, 11, function(result) {
                                assert.equal(true, result.code);
                                done();
                            })
                        });
                    }
                });
            });
            it('Clear Test', function(done) {
                var op = Model_factory('ad.space.group.set')
                    .where('1:1')
                    .list(function(result) {
                        console.log("list result=" + JSON.stringify(result));
                    }).del();
                op.list(function(result) {
                    console.log("Clear Test result=" + JSON.stringify(result));
                    assert.equal(0, result.value.length)
                    done()
                })
            });
            it('Clear Set', function(done) {
                var op = Model_factory('ap.state.auth.set').where('1').p(['1', '2', '3']).save(function(result) {
                    op = op.list(function(result) {
                        console.log(result)
                        op = op.clear(function(result) {
                            console.log(result)
                            console.log('clear SET')
                            assert.equal(1, result.code)
                            op.list(function(result) {
                                console.log(result)
                                done();
                            })
                        })
                    })
                })
            });
        })
        var exportName
        it("registerModel of PG", function(done) {
            co(function*() {
                exportName = "a_new_model_table"
                var conf = {
                    "name": "test_model_table",
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
                yield model_module.registerModel(exportName, conf)
                should.exist(table_operator(exportName))
                var newEntry = {
                    "owner": 10001,
                    "type": "win",
                    "change": 999999.9999,
                    "transaction_time": new Date()
                }
                var op = Model_factory(exportName).p(newEntry).save(function() {
                    op = op.list(function(entries) {
                        console.log("[ registerModel of PG ] get entries:", JSON.stringify(entries))
                        var entry = entries.value.pop()
                        entry.create_time.should.be.a.Date()
                        entry.update_time.should.be.a.Date()
                        done()
                    })
                })
            })
        })

        it("del entries in Model of PG", function(done) {
            op = Model_factory(exportName)
            op.list()
                .del(entries => should(entries.code).equal(1))
                .list(entries => {
                    console.log("[ del entries in Model of PG ] get entries:", JSON.stringify(entries))
                    should(entries.value.length).equal(0)
                    done()
                })
        })


        it("del Model of PG", function(done) {
            op = table_operator(exportName)
            op.model.drop(err => {
                should.not.exist(err)
                done()
            })
        })
    })
}

["tair", "redis"].forEach(modelTest)