var transcode = require('./utils').transcode
var promisify = require("bluebird").promisify

//this.tair
var cli = require('node-tair-rdb');
var configServer = [{
    host: 'tair',
    // host: '172.17.0.7',
    port: 5198,
    // host: '127.0.0.1',
    // port: 10379
}];


function encode(value, type) {
    if (value instanceof Array) {
        return value.map(item => _encode(item, type))
    } else {
        return _encode(value, type)
    }
}

function _encode(value, type) {
    if (type === 'int' || type === 'long' || type === "int8") {
        return parseInt(value)
    } else if (type === 'float' || type === 'double') {
        var fValue = parseFloat(value)
        var buffer = new Buffer(8);
        buffer.writeDoubleLE(fValue, 0);
        return buffer;
    } else {
        return value
    }
}

function writeErrorHandling(err) {
    if (err.message === "-20004") {
        return 0
    } else if (err.message === "-3996") {
        throw new Error("WRONGTYPE Operation against a key holding the wrong kind of value")
    } else
        throw err
}

function DB(namespace, conf) {
    this.dbName = namespace || 2;
    this.tair = null;
    if (conf === undefined || conf === null) {
        this.conf = {
            port: 5198,
            host: "tair"
        }
    } else {
        this.conf = conf
    }
}

DB.prototype.q_connect = function() {
    var that = this
    return new Promise(function(resolve, reject) {
        that.tair = new cli('group_1', [that.conf], function(err) {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        });
    })
}

DB.prototype.setKV = function(key, value, valueType) {
    var q_set = promisify(this.tair.set, {
        context: this.tair
    })
    if (value === undefined || value === null) {
        return Promise.reject(new Error("DB.prototype.setKV() value should not be empty"))
    }
    return q_set(key, encode(value, valueType), 0, this.dbName, 0)
}

DB.prototype.setCounter = function(key, value) {
    var q_set = promisify(this.tair.set, {
        context: this.tair
    })
    if (typeof value !== "number") {
        return Promise.reject(new Error("DB.prototype.setCounter wrong type of value"))
    } else
        return q_set(key, value.toString(), 0, this.dbName, 0)
}


DB.prototype.rmK = function(key) {
    var q_remove = promisify(this.tair.remove, {
        context: this.tair
    })
    return q_remove(key, this.dbName).then(() => 1).catch(function(err) {
        //console.error("DB.prototype.rmK() err:" + err.stack || err);
        if (err.message === "-3998") {
            console.error("DB.prototype.rmK key:" + key + " not exists");
            return 0
        } else {
            throw err
        }
    })
}

DB.prototype.getV = function(key, type) {
    if (type == undefined)
        type = 'string';

    var that = this
    return new Promise(function(resolve, reject) {
        that.tair.get(key, that.dbName, function(err, data) {
            if (err) {
                if (err === -3998) {
                    resolve(null)
                } else {
                    if (err instanceof Error) {
                        reject(err)
                    } else {
                        reject(new Error(err))
                    }

                }
            } else {
                resolve(data)
            }
        }, type)
    })
}

DB.prototype.setSV = function(key, value, valueType) {
    var that = this
    var q_sadd = promisify(this.tair.sadd, {
        context: this.tair
    })
    if (value instanceof Array) {
        return Promise.all(value.map(function(item) {
            return q_sadd(key, that.dbName, encode(item, valueType)).then(() => 1).catch(writeErrorHandling)
        })).then(results => results.reduce((pre, cur) => pre + cur))
    } else if (value === null || value === undefined) {
        return Promise.reject(new Error("DB.prototype.setSV() value should not be empty"))
    } else {
        return q_sadd(key, this.dbName, encode(value, valueType)).then(() => 1).catch(writeErrorHandling)
    }
}


DB.prototype.getSV = function(key, type) {
    if (type == undefined)
        type = 'string'
    var that = this
    return new Promise(function(resolve, reject) {
        that.tair.smembers(key, that.dbName, function(err, data) {
            if (err == -3998) {
                resolve([])
            } else {
                if (err != null) {
                    if (err instanceof Error) {
                        reject(err)
                    } else {
                        reject(new Error(err))
                    }
                } else {
                    resolve(data);
                }
            }
        }, type)
    })
}

DB.prototype.getZV = function(key, type, start, end) {
    if (type === undefined)
        type = 'string'
    start = start || -Number.MAX_VALUE;
    end = end || Number.MAX_VALUE;
    var that = this

    return new Promise(function(resolve, reject) {
        that.tair.zrangebyscore(key, that.dbName, start, end, function(err, data) {
            if (err === -3998) {
                resolve([])
            } else {
                if (err != null) {
                    if (err instanceof Error) {
                        reject(err)
                    } else {
                        reject(new Error(err))
                    }
                } else {
                    resolve(data);
                }
            }
        }, type);
    })
}
DB.prototype.setZV = function(key, value, score, valueType) {
    var q_zadd = promisify(this.tair.zadd, {
        context: this.tair
    })

    if (value === null || value === undefined) {
        return Promise.reject(new Error("DB.prototype.setZV() value should not be empty"))
    }
    return q_zadd(key, this.dbName, encode(value, valueType), score)
        .then(() => 1)
        .catch(writeErrorHandling)
}



DB.prototype.incr = function(key, count) {
    var q_incr = promisify(this.tair.incr, {
        context: this.tair
    })
    if (typeof count !== 'number') {
        incr_num = 1
    } else {
        incr_num = count
    }
    return q_incr(key, incr_num, this.dbName, 0, 0)
}

DB.prototype.rmSV = function(key, value, valueType) {
    var q_srem = promisify(this.tair.srem, {
        context: this.tair
    })
    return q_srem(key, this.dbName, encode(value, valueType)).then(() => 1).catch(function(err) {
        if (err.message === "-3998") {
            console.log("DB.prototype.rmSV key:" + key + " value:" + value + " not exists");
            return 0
        } else {
            throw err
        }
    })
}

DB.prototype.rmZV = function(key, value, valueType) {
    var q_zrem = promisify(this.tair.zrem, {
        context: this.tair
    })

    return q_zrem(key, this.dbName, encode(value, valueType)).then(() => 1).catch(function(err) {
        if (err.message === "-3998") {
            console.log("DB.prototype.rmZV key:" + key + " value:" + value + " not exists")
            return 0
        } else {
            throw err
        }
    })
}

DB.prototype.setHSV = function(key, hashKey, value, valueType) {
    var q_hset = promisify(this.tair.hset, {
        context: this.tair
    })
    if (typeof hashKey === "number")
        hashKey = '' + hashKey

    return q_hset(key, this.dbName, hashKey, encode(value, valueType))
}

DB.prototype.getHSV = function(key) {
    var q_hgetall = promisify(this.tair.hgetall, {
        context: this.tair
    })
    return q_hgetall(key, this.dbName)
}

exports.DB = DB;