var co = require("co")
    //condition example: {goods_name:"xiaoxiao"}
function operator(table_name, tables) {
    this.model = tables[table_name]
}
operator.prototype.add = function(message, callback) {
    if (message == undefined) {
        return "message undefined"
    } else
        this.model.create(message, function(err, items) {
            if (err) {
                console.log(err);
                callback(0)
            } else {
                callback(1, items)
            }
        })
}
operator.prototype.find = function(condition, callback) {
    if (condition == undefined) {
        return "condition undefined"
    }
    this.model.find(condition, function(err, result) {
        if (err) {
            console.log(err);
            callback(0)
        } else {
            callback(1, result)
        }
    })
}
operator.prototype.get_model = function() {
    return this.model
}

operator.prototype.count = function(condition, callback) {
    if (condition == undefined) {
        return "condition undefined"
    }
    this.model.count(condition, function(err, count) {
        if (err) {
            if (err.stack != undefined) {
                console.log('./DAO/orm/pgsql.db.dao.js-count():err=' + err.stack);
                callback(0)
            } else {
                console.log('./DAO/orm/pgsql.db.dao.js-count():err=' + err);
                callback(0);
            }
        } else {
            callback(1, count)
        }
    })
}

operator.prototype.update = function(condition, new_message, callback) {
    if (condition == undefined) {
        return "condition undefined"
    } else if (new_message == undefined) {
        return "new_message undefined"
    }
    this.model.find(condition, function(err, result) {
        if (typeof(result) == "undefined") {
            return callback(0, "PG operator.prototype.update fail to get item")
        }
        return result.reduce(function(seq, item, item_index) {
                for (var i in new_message) {
                    item[i] = new_message[i]
                }
                return seq.then(function() {
                    return new Promise(function(resolve, reject) {
                        item.save(function(err) {
                            if (err) {
                                reject("PG operator.prototype.update item:" + JSON.stringify(item) + ", err:" + err)
                            } else {
                                resolve("success")
                            }
                        })
                    })
                })
            }, Promise.resolve("PG operator.prototype.update item not found")).then(function(msg) {
                callback(1, result)
            }).catch(function(err) {
                console.log(err)
                callback(0, err)
            })
            /*for (var i in new_message) {
                result[0][i] = new_message[i]
            }
            result[0].save(function(err) {
                if (err) {
                    console.log(err)
                    callback(0)
                } else {
                    callback(1)
                }
            })*/
    })
}
operator.prototype.del = function(condition, callback) {
    if (condition == undefined) {
        return "condition undefined"
    }
    this.model.find(condition, function(err, result) {
        try {
            result[0].remove(function(err) {
                if (err) {
                    console.log(err);
                    callback(0)
                } else {
                    callback(1)
                }
            })
        } catch (msg) {
            callback(0);
        }
    })
}

exports.table_operator = () => {
    return null
}
exports.q_get_table_operator = () => {
    return co(function*() {
        var tables = yield require('./pgsql.db.config.js')
        return (table_name) => {
            if (tables[table_name] == undefined)
                return null
            else
                return new operator(table_name, tables)
        }
    })
}
require('./pgsql.db.config.js').then(function(tables) {
    exports.table_operator = (table_name) => {
        if (tables[table_name] == undefined)
            return null
        else
            return new operator(table_name, tables)
    }
})
