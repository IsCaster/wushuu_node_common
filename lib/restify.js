var model_module = require('../DAO/Model');
var Model_factory = model_module.Model_factory;
var table_ope = require('../DAO/orm/pgsql.db.dao.js').table_operator
var co = require('co')
var utils = require('./common')

var list_gen = function(MODEL_NAME,MODEL_NAME_URL,before,after) {

    return function(ctx){
            var handler = function(req, res) {

            res.header('Content-Type', 'application/json');

            co(function*(){
                if(!!before && (before instanceof Function)) 
                {
                    yield before(req,res)
                }
                var all_keys = Model_factory(MODEL_NAME).keys
                
                var where = utils.getUsefulKeys(all_keys, req,'GET')

                if(req.query.or != undefined){
                    where.or = req.query.or
                }

                var index = req.query.index
                
                var filter = req.query['filter']

                var order_by = ''

                var order_name = ''
                
                var order = ['id','A'] 
                
                if(filter != undefined)
                {   
                    try
                    {
                        var order_array = filter['order'].split(' ')
                        if(order_array.length == 1)
                        {
                            order = [order_array[0],'A']
                        }else{
                            order_by = order_array[order_array.length-1]
                            order_name = order_array[0]
                            order = [order_name,order_by]
                        }

                    }catch(msg){
                        reject(new Error('request parameter Error'))
                    }
                }

                if(index == undefined)
                {
                    index = 0
                }
                var page_size = req.query.page_size

                if(page_size != undefined)
                {
                    page_size = parseInt(page_size,10)
                }

                console.log('where = '+JSON.stringify(where))

                var model = table_ope(MODEL_NAME).get_model()

                var data = yield new Promise(function(resolve,reject){
                    
                    model.find(where,{offset:page_size*index},page_size,order,function(err,result){
                        if(err)
                        {
                            reject(err)
                        }
                        else
                        {
                            resolve(result)
                        }
                    })
                })
                if(!!after && (after instanceof Function)) 
                {
                   data =  yield after(data)
                }
                
                res.send({
                        'code' : 1,
                        'msg' : 'success',
                        'data' :data
                })
                
            }).catch(function(err){
                utils.failHandler(res,err.message)
                console.log('./web/common.db.op.js-list_gen():err = '+err.stack)
            })

        }
        ctx.express.get('/' + MODEL_NAME_URL + '/list', handler);
    }
}


var count_gen = function(MODEL_NAME,MODEL_NAME_URL,before) {

    return function(ctx){
            var handler = function(req, res) {

            res.header('Content-Type', 'application/json');

            co(function*(){

                if(!!before && (before instanceof Function)) 
                {
                    yield before(req,res)
                }
                var all_keys = Model_factory(MODEL_NAME).keys
                var where = utils.getUsefulKeys(all_keys, req,'GET')

                if(req.query.or != undefined){
                    where.or = req.query.or
                }

                var model = table_ope(MODEL_NAME).get_model()

                var count = yield new Promise(function(resolve,reject){

                    model.count(where,function(err,result){
                        if(err)
                        {
                            reject(err)
                        }
                        else
                        {
                            resolve(result)
                        }

                    })
                })

                res.send({
                    'code' : 1,
                    'msg' : 'success',
                    'data' :count
                })
                
            }).catch(function(err){
                utils.failHandler(res,err.message)
                console.log('./web/common.db.op.js-count_gen():err = '+err.stack)
            })

        }
        ctx.express.get('/' + MODEL_NAME_URL + '/count', handler);
    }
}


module.exports = {
    'list_gen' : list_gen,
    'count_gen' : count_gen
}
