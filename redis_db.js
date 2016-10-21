var Redis = require('ioredis');
var transcode = require('../utils/common').transcode


function DB(namespace) {
    this.dbName = namespace || 2;
    this.redis = new Redis(6379, 'WUSHUU-REDIS', {
        "db": this.dbName
    })
}

DB.prototype.q_connect = function() {
    return Promise.resolve()
}

DB.prototype.setKV = function(key, value) {
    return this.redis.set(key, value)
}

DB.prototype.rmK = function(key) {
    return this.redis.del(key)
}

DB.prototype.getV = function(key, type) {
    return this.redis.get(key).then(value => transcode(value, type))
}

DB.prototype.setSV = function(key, value) {
    if (value instanceof Array)
        return this.redis.sadd(key, ...value)
    else
        return this.redis.sadd(key, value)
}


DB.prototype.getSV = function(key, type) {
    return this.redis.smembers(key).then(value => transcode(value, type))
}

DB.prototype.getZV = function(key, type, start, end) {
    if (type == undefined)
        type = 'string'
    start = start || -Math.pow(2, 32);
    end = end || Math.pow(2, 32);
    return this.redis.zrangebyscore(key, start, end).then(value => transcode(value, type))
}

DB.prototype.setZV = function(key, value, score) {
    return this.redis.zadd(key, score, value)
}

DB.prototype.incr = function(key, count) {
    if (typeof count !== 'number') {
        incr_num = 1
    } else {
        incr_num = count
    }
    return this.redis.incrby(key, incr_num)
}

DB.prototype.setCounter = function(key, value) {
    if (typeof value !== "number") {
        return Promise.reject(new Error("DB.prototype.setCounter wrong type of value"))
    } else
        return this.redis.set(key, value)
}

DB.prototype.rmSV = function(key, value) {
    return this.redis.srem(key, value)
}

DB.prototype.rmZV = function(key, value) {
    return this.redis.zrem(key, value)
}

DB.prototype.setHSV = function(key, hashKey, value) {
    return this.redis.hset(key, hashKey, value)
}

DB.prototype.getHSV = function(key) {
    return this.redis.hgetall(key).then(list =>
        Object.keys(list).map((field) => {
            return {
                field: field,
                value: list[field]
            }
        })
    )
}

exports.DB = DB;