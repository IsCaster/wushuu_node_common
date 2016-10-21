var db_module = require('../DAO/db');
var model_module = require('../DAO/Model');
var Model_factory = model_module.Model_factory;
var assert = require('assert')
describe('Model operation ', function() {
    before(function(done) {
        var db = new db_module.DB();
        db.q_connect().then(function() {
            console.log('memory db connected')
            model_module.Model_setDB(db);
            done();
        })
    });
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
    });
    describe('Model SET UP AP->OWNER', function() {
        it('add all ap to owner 1', function(done) {
            done();
        })
    })
})