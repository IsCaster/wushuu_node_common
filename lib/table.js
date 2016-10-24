function TABLE(table_name) {
    this.table_name = table_name;
}
TABLE.prototype.ID_SET = function() {
    return this.table_name + ".set";
}

TABLE.prototype.INDEX = function() {
    return this.table_name + ".counter";
}

TABLE.prototype.setID = function(space_id) {

    return (function(space_id, table_name) {
        return function(attribute) {
            return table_name + ":" + space_id + ":" + attribute;
        };
    })(space_id, this.table_name)

}

function TABLE_TYPE(db, key, valueType, keyType) {
    //string | decimal (int , float )
    this.valueType = valueType || 'string';
    //simple | set | zset
    this.keyType = keyType || 'simple';

    this.db = db;

    this.key = key;
}

TABLE_TYPE.prototype.set = function(VALUE, SCORE) {
    if (SCORE == undefined)
        SCORE = VALUE;
    if (this.keyType == 'simple') {
        return this.db.setKV(this.key, VALUE, this.valueType);
    } else if (this.keyType == 'set') {
        return this.db.setSV(this.key, VALUE, this.valueType);
    } else if (this.keyType == 'zset') {
        return this.db.setZV(this.key, VALUE, SCORE, this.valueType);
    } else if (this.keyType == 'hset') {
        return this.db.setHSV(this.key, VALUE, SCORE, this.valueType)
    }
}

TABLE_TYPE.prototype.get = function(start, limit) {
    var valueType = this.valueType;
    if (this.keyType == 'simple') {
        return this.db.getV(this.key, valueType)
    } else if (this.keyType == 'set') {
        return this.db.getSV(this.key, valueType)
    } else if (this.keyType == 'zset') {
        return this.db.getZV(this.key, valueType, start, limit)
    } else if (this.keyType == 'hset') {
        //TODO add type parameters
        return this.db.getHSV(this.key, valueType)
    }
}
TABLE_TYPE.prototype.rm = function(VALUE) {
    if (this.keyType == 'simple') {
        return this.db.rmK(this.key);
    } else if (VALUE !== undefined && VALUE !== null) {
        if (this.keyType == 'set') {
            return this.db.rmSV(this.key, VALUE, this.valueType);
        } else if (this.keyType == 'zset') {
            return this.db.rmZV(this.key, VALUE, this.valueType);
        } else {
            return Promise.reject(new Error("TABLE_TYPE.prototype.rm() failed unkown keyType=" + this.keyType + ", key=" + this.key + ", value=" + value))
        }
    } else {
        return this.db.rmK(this.key)
    }
}

exports.TABLE_TYPE = TABLE_TYPE;
exports.TABLE = TABLE;