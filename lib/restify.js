var model_module = require('./Model');
var Model_factory = model_module.Model_factory;
var table_ope = require('./orm/pgsql.db.dao.js').table_operator
var co = require('co')
var utils = require('./utils')
var md5 = require('./md5/md5')
var _ = require('lodash')

function checkValid(req, all_keys) {
    if (all_keys.valid !== undefined && req.query.valid != undefined) {
        var valids = req.query.valid
        if (valids instanceof Array && [0, 1].toString() === valids.sort().toString()) {
            req.query.valid = [0, 1]
        } else {
            req.query.valid = 1
        }
    } else {
        req.query.valid = 1
    }
}

var list_gen = function(MODEL_NAME, MODEL_NAME_URL, before, after) {
    return function(ctx) {
        var handler = function(req, res) {

            res.header('Content-Type', 'application/json');

            co(function*() {
                if (before instanceof Function) {
                    yield before(req, res)
                }
                var all_keys = Model_factory(MODEL_NAME).keys
                checkValid(req, all_keys)
                var where = utils.getUsefulKeys(all_keys, req, 'GET')
                if (req.query.id != undefined) {
                    where.id = req.query.id
                }

                if (req.query.or != undefined) {
                    where.or = req.query.or
                }

                var index = req.query.index

                var filter = req.query['filter']

                var order_by = ''

                var order_name = ''

                var order = ['id', 'A']

                var model = table_ope(MODEL_NAME).get_model()

                if (filter != undefined && filter['order'] != undefined) {
                    try {
                        var order_array = filter['order'].split(' ')
                        if (order_array.length == 1) {
                            order = [order_array[0], 'A']
                        } else {
                            order_by = order_array[order_array.length - 1]
                            order_name = order_array[0]
                            order = [order_name, order_by]
                        }
                    } catch (msg) {
                        return Promise.reject(new Error('request parameter Error'))
                    }
                }
                if (filter != undefined && filter['distinct'] != undefined) {
                    distinct_handler(req, res, model, MODEL_NAME, MODEL_NAME_URL)
                    return
                }
                if (index == undefined) {
                    index = 0
                }
                var page_size = req.query.page_size

                if (page_size != undefined) {
                    page_size = parseInt(page_size, 10)
                }
                console.log('./web/common.db.op.js-list_gen():where = ' + JSON.stringify(where))

                var data = yield new Promise(function(resolve, reject) {

                    model.find(where, {
                        offset: page_size * index
                    }, page_size, order, function(err, result) {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result)
                        }
                    })
                })
                if (after instanceof Function) {
                    data = yield after(data)
                }
                res.send({
                    'code': 1,
                    'msg': 'success',
                    'data': data,
                })

            }).catch(function(err) {
                utils.failHandler(res, err.message)
                console.log('./web/common.db.op.js-list_gen():err = ' + err.stack)
            })

        }
        ctx.express.get('/' + MODEL_NAME_URL + '/list', handler);
    }
}


var distinct_handler = function(req, res, model, MODEL_NAME, MODEL_NAME_URL) {
    res.header('Content-Type', 'application/json');
    co(function*() {
        var distinct_col = req.query.filter['distinct']
        if (distinct_col != undefined) {
            var distinct_obj = {}
            var distinct_col_key = Object.keys(distinct_col)
            var ret = yield new Promise(function(resolve, reject) {
                model.aggregate().distinct(distinct_col_key).get(function(err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                })
            })
            distinct_obj[distinct_col_key] = ret
        } else {
            throw new Error('required parameter!')
        }
        res.send({
            'code': 1,
            'msg': 'success',
            'data': distinct_obj
        })
    }).catch(function(err) {
        utils.failHandler(res, err.message)
        console.log('./web/common.db.op.js-distinct_gen():err = ' + err.stack)
    })
}
var count_gen = function(MODEL_NAME, MODEL_NAME_URL, before) {

    return function(ctx) {
        var handler = function(req, res) {
            res.header('Content-Type', 'application/json');

            co(function*() {

                if (before instanceof Function) {
                    yield before(req, res)
                }
                var all_keys = Model_factory(MODEL_NAME).keys
                checkValid(req, all_keys)
                var where = utils.getUsefulKeys(all_keys, req, 'GET')

                if (req.query.id !== undefined) {
                    where.id = req.query.id
                }

                if (req.query.or !== undefined) {
                    where.or = req.query.or
                }

                var model = table_ope(MODEL_NAME).get_model()

                var count = yield new Promise(function(resolve, reject) {

                    model.count(where, function(err, result) {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result)
                        }

                    })
                })
                res.send({
                    'code': 1,
                    'msg': 'success',
                    'data': count
                })
            }).catch(function(err) {
                utils.failHandler(res, err.message)
                console.log('./web/common.db.op.js-count_gen():err = ' + err.stack)
            })
        }
        ctx.express.get('/' + MODEL_NAME_URL + '/count', handler);
    }
}

var add_gen = function(MODEL_NAME, MODEL_NAME_URL, before, necessary_attr) {
    return function(ctx) {
        var handler = function(req, res) {
            res.header('Content-Type', 'application/json');
            co(function*() {
                if (before !== undefined) {
                    if (before instanceof Function) {
                        yield before(req, res)
                    } else {
                        necessary_attr = before
                    }
                }

                if (necessary_attr != undefined && !(necessary_attr instanceof Array)) {
                    throw new Error('necessary attribute should be array')
                }
                if (utils.checkNecessary(necessary_attr, req, res, 'POST') == false)
                    return;

                var op = Model_factory(MODEL_NAME);
                var tableProto = table_ope(MODEL_NAME).model.properties;
                table = _.filter(tableProto, item => item.name != 'id')
                var uniqueKey = _.find(table, {
                    'unique': true
                })
                var valid = _.find(table, {
                    'name': 'valid'
                })
                if (uniqueKey != undefined && valid != undefined) {
                    var UNIQUE_KEY = uniqueKey.name
                    var where = {}
                    where[UNIQUE_KEY] = req.body[UNIQUE_KEY]
                    where['valid'] = 0
                    var entity = yield new Promise(function(resolve, reject) {
                        table_ope(MODEL_NAME).get_model().find(where, function(err, result) {
                            if (err) {
                                reject(err)
                            } else {
                                resolve(result)
                            }
                        })
                    })

                    if (entity.length != 0) {
                        yield new Promise(function(resolve, reject) {
                            md5.encrypt(req.body.password, function(encrypted) {
                                req.body.password = encrypted
                                resolve()
                            })
                        })
                        var all_keys = Model_factory(MODEL_NAME).keys;
                        var all_keys = op.keys;
                        var obj = utils.getUsefulKeys(all_keys, req);
                        obj[UNIQUE_KEY] = req.body[UNIQUE_KEY] + '_' + Math.floor(Math.random() * 10) + '_' + (new Date()).getTime()
                        var ret_index = yield new Promise(function(resolve, reject) {
                            op.p(obj).save(function(result) {
                                if (result.code) {
                                    resolve(result.index)
                                } else {
                                    reject(new Error('save fail'))
                                }
                            });
                        })
                        res.send({
                            'code': 1,
                            'index': ret_index,
                            'msg': 'save success'
                        })
                    } else {
                        yield new Promise(function(resolve, reject) {
                            md5.encrypt(req.body.password, function(encrypted) {
                                req.body.password = encrypted
                                resolve()
                            })
                        })
                        var all_keys = Model_factory(MODEL_NAME).keys;
                        var all_keys = op.keys;
                        var setObj = utils.getUsefulKeys(all_keys, req);
                        var ret_index = yield new Promise(function(resolve, reject) {
                            op.p(setObj).save(function(result) {
                                if (result.code) {
                                    resolve(result.index)
                                } else {
                                    reject(new Error('save fail'))
                                }
                            });
                        })
                        res.send({
                            'code': 1,
                            'index': ret_index,
                            'msg': 'save success'
                        })

                    }

                } else {
                    yield new Promise(function(resolve, reject) {
                        md5.encrypt(req.body.password, function(encrypted) {
                            req.body.password = encrypted
                            resolve()
                        })
                    })
                    var all_keys = Model_factory(MODEL_NAME).keys;
                    var all_keys = op.keys;
                    var setObj = utils.getUsefulKeys(all_keys, req);
                    var ret_index = yield new Promise(function(resolve, reject) {
                        op.p(setObj).save(function(result) {
                            if (result.code) {
                                resolve(result.index)
                            } else {
                                reject(new Error('save fail'))
                            }
                        });
                    })
                    res.send({
                        'code': 1,
                        'index': ret_index,
                        'msg': 'save success'
                    })
                }
            }).catch(function(err) {
                utils.failHandler(res, err.message)
                console.log('./web/common.db.op.js-add_gen():err = ' + err.stack)
            })
        }
        ctx.express.post('/' + MODEL_NAME_URL + '/add', handler);
    }
}

var get_gen = function(MODEL_NAME, MODEL_NAME_URL, before) {
    return function(ctx) {
        var handler = function(req, res) {
            res.header('Content-Type', 'application/json');
            co(function*() {
                if (before instanceof Function) {
                    yield before(req, res)
                }
                var id = req.query.id;
                if (id == undefined) {
                    throw new Error('parameter required!')
                }
                var ret_value = yield new Promise(function(resolve, reject) {
                    Model_factory(MODEL_NAME).findOne(parseInt(id, 10), function(result) {
                        if (result.code) {
                            resolve(result.value)
                        } else {
                            reject(new Error('get fail'))
                        }
                    });
                })
                res.send({
                    'code': 1,
                    'value': ret_value
                })
            }).catch(function(err) {
                utils.failHandler(res, err.message)
                console.log('./web/common.db.op.js-get_gen():err = ' + err.stack)
            })
        }
        ctx.express.get('/' + MODEL_NAME_URL + '/get', handler);
    }
}

var update_gen = function(MODEL_NAME, MODEL_NAME_URL, before) {
    return function(ctx) {
        var handler = function(req, res) {
            res.header('Content-Type', 'application/json');
            co(function*() {
                if (before instanceof Function) {
                    yield before(req, res)
                }
                var id = req.body.id;
                if (id == undefined) {
                    throw new Error('parameter required!')
                }
                var op = Model_factory(MODEL_NAME);
                var all_keys = op.keys;
                var setObj = {};
                setObj = utils.getUsefulKeys(all_keys, req);
                yield new Promise(function(resolve, reject) {
                    op.update(parseInt(id, 10), setObj, function(result) {
                        if (result.code) {
                            resolve()
                        } else {
                            reject(new Error('update fail'))
                        }
                    });
                })
                res.send({
                    'code': 1,
                    'msg': 'update success'
                })
            }).catch(function(err) {
                utils.failHandler(res, err.message)
                console.log('./web/common.db.op.js-update_gen():err = ' + err.stack)
            })
        }
        ctx.express.post('/' + MODEL_NAME_URL + '/update', handler);
    }
}

var del_gen = function(MODEL_NAME, MODEL_NAME_URL, before) {
    return function(ctx) {
        var handler = function(req, res) {
            res.header('Content-Type', 'application/json');
            co(function*() {
                if (before instanceof Function) {
                    yield before(req, res)
                }
                var id = req.query.id;
                if (id == undefined) {
                    throw new Error('parameter required!')
                }
                yield new Promise(function(resolve, reject) {
                    Model_factory(MODEL_NAME).del(parseInt(id, 10), function(result) {
                        if (result[0].code) {
                            resolve()
                        } else {
                            reject(new Error('remove fail'))
                        }
                    })
                })
                res.send({
                    'code': 1,
                    'msg': 'remove success'
                })
            }).catch(function(err) {
                utils.failHandler(res, err.message)
                console.log('./web/common.db.op.js-del_gen():err = ' + err.stack)
            })
        }
        ctx.express.get('/' + MODEL_NAME_URL + '/remove', handler);
    }
}

var invalid_gen = function(MODEL_NAME, MODEL_NAME_URL, before) {
    return function(ctx) {
        var handler = function(req, res) {
            res.header('Content-Type', 'application/json');
            co(function*() {
                if (before instanceof Function) {
                    yield before(req, res)
                }
                var id = req.query.id;
                if (id == undefined) {
                    throw new Error('parameter required!')
                }
                yield new Promise(function(resolve, reject) {
                    Model_factory(MODEL_NAME).update(parseInt(id, 10), {
                        valid: 0
                    }, function(result) {
                        if (result.code) {
                            resolve()
                        } else {
                            reject(new Error('remove fail'))
                        }
                    });
                })
                res.send({
                    'code': 1,
                    'msg': 'remove success'
                })
            }).catch(function(err) {
                utils.failHandler(res, err.message)
                console.log('./web/common.db.op.js-invalid_gen():err = ' + err.stack)
            })
        }
        ctx.express.get('/' + MODEL_NAME_URL + '/invalid', handler);
    }
}

module.exports = {
    'list_gen': list_gen,
    'count_gen': count_gen,
    'add_gen': add_gen,
    'get_gen': get_gen,
    'update_gen': update_gen,
    'del_gen': del_gen,
    'invalid_gen': invalid_gen
}