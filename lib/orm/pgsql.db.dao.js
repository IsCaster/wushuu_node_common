var co = require("co")
var getTables = require('./pgsql.db.config').getTables

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
                console.warn("operator.prototype.add() err=", err)
                callback(0, err)
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
            console.warn("operator.prototype.find() err=", err)
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
            console.warn('./DAO/orm/pgsql.db.dao.js-count():err=', err);
            callback(0);
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
                console.warn('operator.prototype.update() err=', err);
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
                    console.warn('operator.prototype.del() err=', err);
                    callback(0)
                } else {
                    callback(1)
                }
            })
        } catch (err) {
            console.warn('operator.prototype.del() catch err=', err);
            callback(0);
        }
    })
}

function table_operator(tableName) {
    var tables = getTables()
    if (tables[tableName] == undefined)
        return null
    else
        return new operator(tableName, tables)
}

module.exports.init = require('./pgsql.db.config').init
module.exports.table_operator = table_operator