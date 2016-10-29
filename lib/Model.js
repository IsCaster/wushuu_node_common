var dao_module = require('./DAO');
var db_module = require('./db')
var pgsqlConfig = require('./orm/pgsql.db.config');
var DAO = dao_module.DAO;
var DAO_OF_SET = dao_module.DAO_OF_SET;
var DAO_OF_PG = dao_module.DAO_OF_PG;
var g_db = null
var MODEL_OBJECTS = {};

function Model(modelName, conf) {
    MODEL_OBJECTS[modelName] = conf
    conf.exportName = modelName
    if (conf.PG) {
        pgsqlConfig.defineTable(modelName, conf)
    }
}

function Model_getDB() {
    return g_db;
}

function Model_factory(modelName) {
    if (modelName)
        if (MODEL_OBJECTS[modelName].set)
            return new Model_actor_SET(MODEL_OBJECTS[modelName]);
        else
            return new Model_actor(MODEL_OBJECTS[modelName]);
}

function Model_actor(model, _pre, _register) {
    if (typeof model === 'boolean') {
        this._pre = model;
        this._register = _pre;
        this.model = this._register.model;
        this.keys = this._register.keys;
        this.where_str = this._register.where_str;
        this.properties = this._register.properties;
    } else {
        this.model = model;
        this.keys = getKeys(model.attr)
        this.where_str = '';
        this._pre = _pre || false;
        this._register = _register;
        this.properties = {};
    }
    this._next = function() {};
    this._selected = [];
}

Model_actor.prototype.regist = function(fn) {
    if (this.is_tail_called)
        fn();
    else
        this._next = fn;
}

Model_actor.prototype.p = function(properties) {
    var pro = {};
    for (var i = 0; i < this.model.attr.length; i++) {
        var dV = '';
        if (this.model.attr[i]['default'] != undefined)
            dV = this.model.attr[i]['default']
        pro[this.model.attr[i].key] = dV;

        var key = this.model.attr[i]['key'];
        if (properties[key]) {
            var type = this.model.attr[i]['type'];
            if (type == 'int') {
                properties[key] = parseInt(properties[key], 10);
            }
            if (type == 'double' || type == 'float') {
                properties[key] = parseFloat(properties[key]);
            }
        }

    }
    for (var item in properties) {
        if (this.keys[item] != undefined)
            if (properties[item] == undefined || properties[item] == null || properties[item] == NaN)
                continue;
            else
                pro[item] = properties[item];
    }
    this.properties = pro;
    if (properties.id != undefined) {
        this.properties.id = parseInt(properties.id, 10)
    }
    return this;
};

Model_actor.prototype.where = function(str) {
    this.where_str = str;
    return this;
};

Model_actor.prototype.findOne = function(index, _callback) {
    var $this = this;
    $this.is_tail_called = false;
    var action = function() {
        var callback = _callback || function() {};
        var dao = $this.createDao();
        dao.findOne(index, function(result) {
            var tag = callback(result);
            if (result.code) {
                $this._selected.length = 0;
                $this._selected.push({
                    'index': result.index
                });
            }
            if (tag == undefined || tag == true) {
                $this.is_tail_called = true;
                $this._next();
            }
        });

    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    //clone attributes
    var nextCtx = new Model_actor(true, $this);
    return nextCtx;
};

Model_actor.prototype.save = function(_callback) {
    var $this = this;
    $this.is_tail_called = false;
    var action = function() {
        var callback = _callback || function() {};
        var dao = $this.createDao();
        dao.save($this.properties, function(result) {
            var tag = callback(result);
            if (result.code) {
                $this._selected.length = 0;
                $this._selected.push({
                    'index': result.index
                });
            }
            if (tag == undefined || tag == true) {
                $this.is_tail_called = true;
                $this._next();
            }
        });

    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    //clone attributes
    var nextCtx = new Model_actor(true, $this);
    return nextCtx;
};

Model_actor.prototype.list = function(_callback) {
    var $this = this;
    $this.is_tail_called = false;
    var action = function() {
        var callback = _callback || function() {};
        var dao = $this.createDao();
        dao.list(function(result) {
            var tag = callback(result);
            if (result.code) {
                $this._selected.length = 0;
                $this._selected = arrayCopy(result.value);
            }
            if (tag == undefined || tag == true) {
                $this.is_tail_called = true;
                $this._next();
            }
        });
    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    //clone attributes
    var nextCtx = new Model_actor(true, $this);
    return nextCtx;
}

Model_actor.prototype.del = function(index, _callback) {
    var $this = this;
    $this.is_tail_called = false;
    if (arguments.length == 1) {
        if (typeof index === 'function') {
            _callback = index
            index = undefined
        }
    }

    var action = function() {
        var _selected = [];
        if (index === undefined || index === null) {
            _callback = index;
            _selected = $this._register._selected;
        } else {
            if ($this._pre) {
                $this._register._selected.length = 0;
                $this._register._selected.push({
                    'index': index
                });
                _selected = $this._register._selected;
            } else {
                _selected.push({
                    'index': index
                });
            }
        }
        var callback = _callback || function() {};
        var dao = $this.createDao()
        var ansyMap = new db_module.ansyMap(_selected);

        ansyMap.onDone = function() {
            var tag = callback(this.results);
            if (tag == undefined || tag == true) {
                $this.is_tail_called = true;
                $this._next();
            }
        }
        ansyMap.map(function(item) {
            var $$this = this;
            dao.del(item.index, function(result) {
                $$this.done(result);
            });
        });
    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    //clone attributes
    var nextCtx = new Model_actor(true, $this);
    return nextCtx;
}

Model_actor.prototype.update = function(index, model, _callback) {
    var $this = this;
    $this.is_tail_called = false;
    //$this.p(model);
    //model = $this.properties;
    var action = function() {
        var callback = _callback || function() {};
        var dao = $this.createDao();
        dao.update(index, model, function(result) {
            var tag = callback(result);
            if (tag == undefined || tag == true) {
                $this.is_tail_called = true;
                $this._next();
            }
        });
    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    //clone attributes
    var nextCtx = new Model_actor(true, $this);
    return nextCtx;
}

Model_actor.prototype.filter = function(conf) {
    var $this = this;
    $this.is_tail_called = false;
    var action = function() {
        if (conf != undefined) {
            var pre_selected = $this._register._selected;
            for (var i = 0; i < pre_selected.length; i++) {
                if (pre_selected[i][conf.key] != undefined) {
                    if (pre_selected[i][conf.key] == conf.value) {
                        $this._selected.push(pre_selected[i]);
                    }
                }
            }
        }

        $this.is_tail_called = true;
        $this._next();
    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    //clone attributes
    var nextCtx = new Model_actor(true, $this);
    return nextCtx;
}

Model_actor.prototype.isOkay = function(result) {
    if (result.code) {
        return true;
    } else {
        return false;
    }
}

Model_actor.prototype.createDao = function() {
    var $this = this;
    if ($this.model.PG == false || $this.model.PG == undefined) {
        var attr = [];
        for (var i = 0; i < $this.model.attr.length; i++) {
            if ($this.model.attr[i].type != 'set')
                attr.push({
                    'key': $this.model.attr[i].key,
                    'valueType': $this.model.attr[i].type
                });
            else {
                attr.push({
                    'key': $this.model.attr[i].key,
                    'type': $this.model.attr[i].type,
                    'valueType': $this.model.attr[i].valueType
                })
            }
        }
        var conf_name = $this.model.name + ':' + $this.where_str;
        if ($this.where_str == '')
            conf_name = $this.model.name;
        var conf = {
            'name': conf_name,
            'attr': attr
        }
        if (this.properties.id != undefined) {
            conf['id'] = this.properties.id
        }
        var dao = new DAO(conf, g_db);
        return dao;
    } else {
        var where = {};
        if (typeof $this.where_str == 'object')
            where = $this.where_str;
        var dao = new DAO_OF_PG({
            'table': $this.model.exportName,
            'where': where
        });
        return dao;
    }
};

function Model_actor_SET(model, _pre, _register) {
    if (typeof model === 'boolean') {
        this._pre = model;
        this._register = _pre;
        this.model = this._register.model;
        this.where_str = this._register.where_str;
        this.properties = this._register.properties;
    } else {
        this.model = model;
        this.where_str = '';
        this._pre = _pre || false;
        this._register = _register;
        this.properties = {};
    }
    this._next = function() {};
    this._selected = [];
}

Model_actor_SET.prototype.regist = function(fn) {
    if (this.is_tail_called)
        fn();
    else
        this._next = fn;
}

Model_actor_SET.prototype.p = function(properties, scores) {
    this.properties = [];
    if (scores)
        this.scores = scores;

    for (var i = 0; i < properties.length; i++) {
        var score = scores == undefined ? 1 : scores[i]
        this.properties.push({
            'value': properties[i],
            'score': score
        })
    }
    return this;
};

Model_actor_SET.prototype.where = function(str) {
    this.where_str = str;
    return this;
};

Model_actor_SET.prototype.save = function(_callback) {
    var $this = this;
    // $this.is_tail_called = false;
    var action = function() {
        var callback = _callback || function() {};
        var dao = $this.createDao();
        var ansyMap = new db_module.ansyMap($this.properties);
        ansyMap.onDone = function() {
            var tag = callback(this.results);
            if (tag == undefined || tag == true) {
                // $this.is_tail_called = true;
                $this._next();
            }
        }
        $this._selected.length = 0;
        ansyMap.map(function(item) {
            var $$this = this;
            if ($this.model.type == 'zset') {
                var score = item.score;
                dao.save(item.value, score, function(result) {
                    if (result.code) {
                        $this._selected.push(item);
                    }
                    $$this.done({
                        'index': item,
                        'code': result.code
                    });
                });
            } else {
                dao.save(item.value, function(result) {
                    if (result.code) {
                        $this._selected.push(item);
                    }
                    $$this.done({
                        'index': item,
                        'code': result.code
                    });
                });
            }
        });

    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    //clone attributes
    var nextCtx = new Model_actor_SET(true, $this);
    return nextCtx;
};

Model_actor_SET.prototype.list = function(_callback) {
    var $this = this;
    // $this.is_tail_called = false;
    var action = function() {
        var callback = _callback || function() {};
        var dao = $this.createDao();
        dao.list(function(result) {
            var tag = callback(result);
            if (result.code) {
                $this._selected.length = 0;
                $this._selected = arrayCopy(result.value);
            }
            if (tag == undefined || tag == true) {
                // $this.is_tail_called = true;
                $this._next();
            }
        });
    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    //clone attributes
    var nextCtx = new Model_actor_SET(true, $this);
    return nextCtx;
}

Model_actor_SET.prototype.del = function(index, _callback) {
    var $this = this;
    // $this.is_tail_called = false;
    var action = function() {
        var _selected = [];
        if (typeof index === 'function' || index == undefined) {
            _callback = index || function() {}
            _selected = $this._register._selected;
        } else {
            if ($this._pre) {
                $this._register._selected.length = 0;
                $this._register._selected.push(index);
                _selected = $this._register._selected;
            } else {
                _selected.push(index);
            }
        }
        var callback = _callback || function() {};
        var dao = $this.createDao();
        var ansyMap = new db_module.ansyMap(_selected);
        console.log("Model_actor_SET.del.action() _selected=" + _selected);
        ansyMap.onDone = function() {
            var tag = callback(this.results);
            if (tag == undefined || tag == true) {
                // $this.is_tail_called = true;
                $this._next();
            }
        }
        ansyMap.map(function(item) {
            var $$this = this;
            dao.del(item, function(result) {
                $$this.done({
                    'index': item,
                    'code': result.code
                });
            });
        });

    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    //clone attributes
    var nextCtx = new Model_actor_SET(true, $this);
    return nextCtx;
}

Model_actor_SET.prototype.update = function(value, newValue, _callback) {
    var $this = this;
    var op = this.del(value, function(results) {
        if ($this.isOkay(results)) {
            console.log('del success')
        } else {
            return false;
        }
    });
    op = op.p([newValue]).save(function(results) {
        if ($this.isOkay(results)) {
            console.log('save success')
            _callback({
                'code': true
            })
        } else {
            return false;
        }
    });

    return op;
};

Model_actor_SET.prototype.clear = function(_callback) {
    var $this = this;
    // $this.is_tail_called = false;
    _callback = _callback || function() {};
    var action = function() {
        var dao = $this.createDao();
        dao.destroy(function(result) {
            var tag = _callback(result);
            if (tag == undefined || tag == true) {
                // $this.is_tail_called = true;
                $this._next();
            }
        });
    };
    if ($this._pre == true) {
        $this._register.regist(action);
    } else {
        action();
    }
    var nextCtx = new Model_actor_SET(true, $this);
    return nextCtx;
}

Model_actor_SET.prototype.isOkay = function(results) {
    for (var i = 0; i < results.length; i++) {
        if (results[i].code != 1)
            return false;
    }
    return true;
}

Model_actor_SET.prototype.createDao = function() {
    var $this = this;

    var conf = {
        'name': $this.model.name + ':' + $this.where_str + ':' + $this.model.key,
        'type': $this.model.type,
        'value': $this.model.value
    }

    var dao = new DAO_OF_SET(conf, g_db);
    return dao;
};

function findSet(attrs, keyName) {
    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i]['key'] == keyName)
            return attrs[i];
    }
    return null;
}

function getKeys(attr) {
    var obj = {};
    for (var i = 0; i < attr.length; i++) {
        obj[attr[i].key] = true;
    }
    return obj;
}

function arrayCopy(src) {
    var dst = [];
    for (var i = 0; i < src.length; i++) {
        if (typeof src[i] == 'object') {
            src[i]['index'] = src[i]['index'] || src[i]['id'];
            dst.push(src[i]);
        } else {
            dst.push(src[i])
        }
    }
    return dst;
}

function loadConf(modelConf) {
    Object.keys(modelConf).forEach(modelName => Model(modelName, modelConf[modelName]))
}

function init(modelConf, pg_conn_str, mdb) {
    var DB = db_module.DB

    if (mdb !== undefined) {
        db_module.setMDB(mdb)
    }
    if (!(g_db instanceof DB))
        g_db = new DB()
    return dao_module.init(pg_conn_str).then(() => {
        loadConf(modelConf)
        console.log("Model.js init() model config loaded")
        var sync = pgsqlConfig.sync;
        return sync()
    }).then(() => g_db.q_connect())
}

function registerModel(modelName, conf) {
    Model(modelName, conf)
    var sync = pgsqlConfig.sync
    return sync()
}
exports.registerModel = registerModel
exports.Model_getDB = Model_getDB;
exports.Model_factory = Model_factory;
exports.init = init