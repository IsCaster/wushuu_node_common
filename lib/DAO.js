var assert = require("assert")
var db_module = require('./db');
var table_module = require('./table');

function DAO(conf, db) {
    this.config = conf;
    this.table = new table_module.TABLE(this.config.name);
    this.type_index = new table_module.TABLE_TYPE(db, this.table.ID_SET(), 'int', 'zset');
    this.db = db;
}

DAO.prototype.save = function(model, done) {
    var $this = this;
    var indexGen = this.table.INDEX()
    if (!(done instanceof Function))
        done = () => {}
    var action
    var index

    function set_value(index) {
        var attrGen = $this.table.setID(index);
        return Promise.all($this.config.attr.map(a => {
            var model_value = model[a.key]
            if (model_value instanceof Array && model_value.length == 0) {
                return Promise.resolve()
            } else {
                if (a.type === 'set') {
                    if (a.valueType == 'string') {
                        model_value = model_value.map(function(item) {
                            return item + ''
                        })
                    } else if (a.valueType == 'int') {
                        model_value = model_value.map(function(item) {
                            return isNaN(parseInt(item, 10)) ? 0 : parseInt(item, 10)
                        })
                    } else if (a.valueType == 'double') {
                        model_value = model_value.map(function(item) {
                            return isNaN(parseFloat(item, 10)) ? 0.0 : parseFloat(item, 10)
                        })
                    }
                } else {
                    if (a.valueType == 'string') {
                        model_value = model_value + '';
                    } else if (a.valueType == 'int') {
                        model_value = isNaN(parseInt(model_value, 10)) ? 0 : parseInt(model_value, 10)
                    } else if (a.valueType == 'double') {
                        model_value = isNaN(parseFloat(model_value, 10)) ? 0.0 : parseFloat(model_value, 10)
                    }
                }
                console.log("DAO.prototype.save() valueType=" + a.valueType + " type=" + a.type + " value=" + model_value, ' key=' + a.key)
                return (new table_module.TABLE_TYPE($this.db, attrGen(a.key), a.valueType, a.type)).set(model_value);
            }
        })).then(() => ({
            "code": true,
            "index": index
        }))
    }

    if (model.id != undefined) {
        index = model.id
        action = $this.type_index.set(model.id, model.id).then(function(num) {
            if (num === 0) {
                return $this.update(model.id, model)
            } else {
                return set_value(model.id)
            }
        })
    } else {
        action = $this.db.incr(indexGen).then(function(newIndex) {
            index = newIndex
            console.log("DAO.prototype.save() $this.db.incr() index=" + newIndex)
            return $this.type_index.set(newIndex, newIndex)
        }).then(function(num) {
            if (num === 0) {
                return $this.type_index.get().then(function(data) {
                    var reset_index = data[data.length - 1]
                    console.log('DAO.prototype.save() $this.type_index.get() reset_index = ' + reset_index)
                        //guess new index
                    index = reset_index + 1
                    return $this.db.setCounter(indexGen, reset_index).then(function() {
                        console.log("DAO.prototype.save() reset indexGen")
                        return $this.save(model)
                    })
                })
            } else {
                console.log("DAO.prototype.save() no reset index")
                return set_value(index)
            }
        })
    }
    return action.catch(function(err) {
        console.error("DAO.prototype.save() err=" + err.stack || err)
        ret = {
            'code': false,
            'index': index
        }
        done(ret)
        throw err
    }).then((ret) => {
        done(ret)
        return ret
    })
};

DAO.prototype.findOne = function(index, done) {
    var table = this.table;
    var attrGen = table.setID(index);
    var that = this

    if (!(done instanceof Function))
        done = () => {}

    return Promise.all(this.config.attr.map(a => (new table_module.TABLE_TYPE(that.db, attrGen(a.key), a.valueType, a.type)).get()))
        .then(valueList => {
            if (valueList.some(value => value !== null)) {
                return valueList.reduce((pre, value, index) => {
                    pre[that.config.attr[index].key] = value
                    return pre
                }, {})
            } else {
                throw new Error("deleted data entry, index=" + index)
            }
        })
        .catch(err => {
            console.error("DAO.prototype.findOne() err: " + err.stack || err)
            var result = {
                "code": false,
                "index": index
            }
            done(result)
            throw err
        })
        .then(ret => {
            var result = {
                'code': true,
                'index': index,
                'value': ret
            }
            done(result)
            return result
        })

};
DAO.prototype.list = function(done) {
    var $this = this;
    if (!(done instanceof Function))
        done = () => {}

    return this.type_index.get().then(function(list) {
        return Promise.all(list.map(id => $this.findOne(id)))
    }).catch(function(err) {
        console.error("DAO.prototype.list() err=" + err.stack || err)
        done({
            'code': false
        });
        throw err
    }).then(items => {
        var ret = {
            'code': true,
            'value': items
        }
        done(ret)
        return ret
    })
};
DAO.prototype.update = function(index, model, done) {
    if (!(done instanceof Function))
        done = () => {}
    var $this = this;
    return this.findOne(index).catch(err => {
        var ret = {
            "code": false,
            "index": index
        }
        done(ret)
        throw err
    }).then(result => {
        var attrGen = $this.table.setID(index);
        return Promise.all($this.config.attr.map(a => {
            if (model[a.key] !== undefined) {
                return (new table_module.TABLE_TYPE($this.db, attrGen(a.key), a.valueType, a.type)).set(model[a.key])
            }
        })).catch(err => {
            console.error("DAO.prototype.update() err" + err.stack || err)
            var ret = {
                "code": false,
                "index": index
            }
            done(ret)
            throw err
        }).then(() => {
            var ret = {
                "code": true,
                "index": index
            }
            done(ret)
            return ret
        })
    })
}

DAO.prototype.del = function(index, done) {
    var $this = this;
    var attrGen = this.table.setID(index);
    if (!(done instanceof Function))
        done = () => {}


    return Promise.all(this.config.attr.map(a =>
        (new table_module.TABLE_TYPE($this.db, attrGen(a.key), a.valueType, a.type)).rm()
    )).then(() =>
        $this.type_index.rm(index)
    ).catch(err => {
        console.log("DAO.prototype.del() err=" + err.stack || err)
        done({
            'code': false
        })
        throw err
    }).then(() => {
        var ret = {
            'code': true
        }
        done(ret)
        return ret
    })
}

DAO.prototype.destroy = DAO.prototype.del;


function DAO_OF_SET(conf, db) {
    this.config = conf;
    this.db = db;
    this.table_type = new table_module.TABLE_TYPE(this.db, this.config.name, this.config.value, this.config.type);
}
DAO_OF_SET.prototype.save = function(value, score, done) {
    if (typeof score === 'function')
        done = score;
    this.table_type.set(value, score).then(function() {
        done({
            'code': true
        });
    }).catch(function(err) {
        done({
            'code': false
        });
    })
}

DAO_OF_SET.prototype.list = function(done) {
    this.table_type.get().then(function(data) {
        done({
            'code': true,
            'value': data
        });
    }).catch(function(err) {
        done({
            'code': false
        });
    })
}

DAO_OF_SET.prototype.del = function(value, done) {
    this.table_type.rm(value).then(function() {
        done({
            'code': true
        })
    }).catch(function() {
        done({
            'code': false
        })
    })
};

DAO_OF_SET.prototype.update = function(value, value2, done) {
    var $this = this;
    this.del(value, function(state) {
        if (state.code) {
            $this.save(value2, value2, function(state) {
                done(state)
            })
        }
    })
}

DAO_OF_SET.prototype.destroy = function(done) {
    this.table_type.rm(null).then(function() {
        done({
            'code': true
        })
    }).catch(() =>
        done({
            'code': true
        })
    )
};


function DAO_OF_PG(conf) {
    if (conf.where == undefined || conf.where == '' || conf.where == null)
        this.whereCondition = {};
    else
        this.whereCondition = conf.where;
    var pgDAO = require('./orm/pgsql.db.dao.js').table_operator;
    this.op = pgDAO(conf.table);
    this.conf = conf;
};

DAO_OF_PG.prototype.save = function(model, done) {
    this.op.add(model, function(state, items) {
        done({
            'code': state,
            'index': items != undefined ? items.id : undefined
        });
    })
};

DAO_OF_PG.prototype.list = function(done) {
    var condition = {};
    for (var key in this.whereCondition) {
        condition[key] = this.whereCondition[key];
    }
    this.op.find(condition, function(state, result) {
        done({
            'code': state,
            'value': result
        })
    })
};

DAO_OF_PG.prototype.del = function(index, done) {
    // console.log('pg del')
    // console.log(index)
    this.op.del({
        'id': index
    }, function(state) {
        done({
            'code': state
        });
    });
}

DAO_OF_PG.prototype.update = function(condition, model, done) {
    console.log("DAO_OF_PG.prototype.update model=" + JSON.stringify(model))
    if (typeof(condition) == "number" || typeof(condition) == "string")
        condition = {
            'id': condition
        }
    this.op.update(condition, model, function(state, msg) {
        done({
            'code': state,
            'msg': msg
        });
    });
}

DAO_OF_PG.prototype.findOne = function(index, done) {
    var $this = this;
    this.op.find({
        'id': index
    }, function(state, result) {
        if (typeof(result) == "undefined" || result.length == 0) {
            done({
                'code': 0,
                'value': []
            });
        } else {
            done({
                'code': state,
                'value': result[0]
            });
        }
    });
};


exports.DAO = DAO;
exports.DAO_OF_SET = DAO_OF_SET;
exports.DAO_OF_PG = DAO_OF_PG;