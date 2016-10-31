var model_module = require('./Model');
var Model_factory = model_module.Model_factory;
var table_ope = require('./orm/pgsql.db.dao.js').table_operator
var co = require('co')
var utils = require('./utils')

var list_gen = function(MODEL_NAME, MODEL_NAME_URL, before, after) {

    return function(ctx) {
        var handler = function(req, res) {

            res.header('Content-Type', 'application/json');

            co(function*() {
                if (!!before && (before instanceof Function)) {
                    yield before(req, res)
                }
                var all_keys = Model_factory(MODEL_NAME).keys

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
                if (!!after && (after instanceof Function)) {
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

                if (!!before && (before instanceof Function)) {
                    yield before(req, res)
                }
                var all_keys = Model_factory(MODEL_NAME).keys
                var where = utils.getUsefulKeys(all_keys, req, 'GET')

                if (req.query.id != undefined) {
                    where.id = req.query.id
                }

                if (req.query.or != undefined) {
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

module.exports = {
    'list_gen': list_gen,
    'count_gen': count_gen,
}