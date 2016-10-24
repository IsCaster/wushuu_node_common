var http = require('http');
var table_module = require('./table');
var model_module = require('./Model');
var NodeRSA = require('node-rsa');
var fs = require("fs");
var promisify = require("bluebird").promisify
var co = require("co")
var Model_factory = model_module.Model_factory;

var fileread = promisify(fs.readFile);
var tag_list = {}

var get_tags_from_pg = function() {
    return new Promise((resolve, reject) => {
        if (Object.keys(tag_list).length === 0) {
            var op = Model_factory('tags_define').list(function(result) {
                if (result.code && result.value !== null) {
                    for (var i = 0; i < result.value.length; i++) {
                        tag_list[result.value[i]['tag_id']] = result.value[i].tag_name
                    }
                    resolve(tag_list)
                } else {
                    reject(new Error('get tags_define fail'))
                }
            })
        } else {
            resolve(tag_list)
        }
    })
}
var err_msg = {
    "-20004": "[tair-rdb] data already exists",
    "-20005": "[tair-rdb] data not exists in selected range",
    "-3998": "[tair-rdb] data not exists",
}

function get_err_msg(code) {
    if (typeof(err_msg[code]) != "undefined") {
        return err_msg[code]
    } else {
        return "err code:" + code + ", unkown err message!"
    }
}

var censor_encrypt = function() {
    return Promise.reject("initializing or failed")
}

fileread(__dirname + '/rsa/censor_public_key.pem', 'utf-8').then(function(data) {
    var options = {
        encryptionScheme: {
            scheme: 'pkcs1', //scheme
            hash: 'md5', //hash using for scheme
        },

        signingScheme: {
            scheme: 'pkcs1', //scheme
            hash: 'sha1', //hash using for scheme
        }
    }
    var key = new NodeRSA(data, 'pkcs1-public', options);
    module.exports.censor_encrypt = function(text) {
        return new Promise(function(resolve, reject) {
            var result = key.encrypt(text, 'base64');
            resolve(result);
        })
    }

}).catch(function(err) {
    console.error("censor_encrypt initialization failed, err=" + err + ",stack=" + err.stack);
})



function failHandler(res, msg) {
    if (msg !== undefined && msg !== null) {
        msg = msg.stack || msg
    } else {
        msg = 'Fail'
    }
    res.send({
        'code': 0,
        'msg': msg
    })
}

function getSessionOwner(req) {
    var session_owner = req.session['ad.owner'];

    return session_owner;
}

function get_request(param, connection, isEnd) {
    var queryParams = '';
    for (var item in param) {
        if (connection.path != undefined && connection.path == true) {
            queryParams += '/' + item + '/' + param[item];
        } else {
            queryParams += '&' + item + '=' + param[item];
            queryParams = '?' + queryParams;
        }
    }
    var options = {
        host: connection.host,
        port: connection.port,
        path: connection.url + queryParams,
        method: 'GET',
    };

    var callback = isEnd;

    var request = http.request(options, function(response) {

        resp = response;

        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function(chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function() {
            callback(str)
        });
    });

    //等待响应2秒超时

    request.on('socket', function(socket) {
        socket.setTimeout(3000);
        socket.on('timeout', function() {
            request.abort();
            isEnd({})
        });
    });

    request.on('error', function(err) {
        if (err.code === "ECONNRESET") {
            console.log("Timeout occurs");
            //specific error treatment
        }

    });


    request.end();
}

function convert_to_hex(int_str) {
    return ("000000000000" + (+int_str).toString(16)).substr(-12);
}

function mac_format(hex) {
    var mac_arr = hex.split('');
    var mac_str = '';
    for (var i = 0; i < 6; i++) {
        mac_str += ":" + mac_arr[i * 2] + mac_arr[i * 2 + 1];
    }
    mac_str = mac_str.substr(1);
    return mac_str;
}

function int2mac(int_str) {
    return mac_format(convert_to_hex(int_str));
}

function complete(total) {
    var total = total;
    var count = 0;
    var arr = [];
    var end = function() {};
    return {
        'done': function(msg, skip) {
            skip = skip || false;
            if (!skip)
                arr.push(msg);
            count++;
            if (count >= total) {
                end(arr);
            }
        },
        'end': function(callback) {
            end = callback;
        }
    }
};

function readKey(key, valueType, objectType) {
    var db = model_module.Model_getDB();
    var duration_op = new table_module.TABLE_TYPE(db, key, valueType, objectType);
    return duration_op.get()
}


function checkNecessary(keys, req, res, type) {
    var dict;
    if (type == 'GET' || type == undefined)
        dict = req.query;
    else
        dict = req.body;
    for (key of keys) {
        if (dict[key] === undefined) {
            require_param(res, key);
            return false;
        }
    }
    return true;
}

function checkAllKeys(keys, req, type) {
    var dict;
    if (type == 'GET' || type == undefined)
        dict = req.query;
    else
        dict = req.body;
    for (key in keys) {
        var item = dict[key];
        if (key == "create_time" || key == "update_time") {
            continue;
        } else {
            if (item == undefined) {
                console.log('./utils/common.js-checkAllKeys():undefined key=' + key);
                return false;
            }
        }
    }
    return true;
}

function getUsefulKeys(keys, req, method) {
    var list = {};
    if (method == 'GET') {
        for (var i in keys) {
            if (req.query[i] != undefined) {
                list[i] = req.query[i]
            }
        }
    } else {
        for (var i in keys) {
            if (req.body[i] != undefined) {
                list[i] = req.body[i];
            }
        }
    }
    return list;
}

function require_param(res, key) {
    if (key)
        key = '[' + key + ']';
    else
        key = 'parameter';
    res.send({
        'code': 0,
        'msg': key + ' required'
    })
}

function check_response(err, body, success_code) {
    return new Promise(function(resolve, reject) {
        if (typeof(success_code) == "undefined")
            success_code = 1
        if (err) {
            reject(new Error("check response, request err=" + err))
        } else if (body == "" || typeof(body) == "undefined") {
            reject(new Error("check response body is not existed"))
        } else {
            try {
                if (body instanceof Object)
                    ret = body
                else
                    ret = JSON.parse(body)

            } catch (err) {
                reject(new Error("check response, JSON.parse(body) err, body=" + body))
            }
            if (ret.code != success_code) {
                reject(new Error("check response err, body=" + body))
            } else {
                resolve(ret)
            }
        }
    })
}

function db_op_callback(ctx, code, result) {
    if (code) {
        ctx.resolve(result)
    } else {
        if (result instanceof Error) {
            ctx.reject(result)
        } else if (typeof(result) == "undefined") {
            ctx.reject()
        } else {
            ctx.reject(new Error(result))
        }
    }
}

function mac_dec_hex(mac_dec) {
    var mac_hex = parseInt(mac_dec).toString(16);
    while (mac_hex.length < 12) {
        mac_hex = '0' + mac_hex;
    }
    mac_hex = mac_hex.substring(0, 2) + ':' + mac_hex.substring(2, 4) + ':' + mac_hex.substring(4, 6) + ':' + mac_hex.substring(6, 8) + ':' + mac_hex.substring(8, 10) + ':' + mac_hex.substring(10, 12)
    return mac_hex;
}

var getSessionSpecialOwner = function(req) {
    var session_special_owner = req.session['ad.owner.special'];

    return session_special_owner;
}
var check_oa_user = function(req, res) {
    return new Promise(function(resolve, reject) {
        var owner = getSessionSpecialOwner(req);
        if (owner == undefined) {
            reject(new Error('login required'))
        }
        resolve()
    })
}

var apiErrorHandlerGen = function(api_url, res) {
    return function(err) {
        if (!(err instanceof Error)) {
            err = new Error(err)
        }
        if (err.message == "-10010") {
            res.send({
                'code': parseInt(err.message),
                'msg': 'Permission is not enough!'
            })
        } else if (err.message == "-10012") {
            res.send({
                'code': parseInt(err.message),
                'msg': 'Permission is not enough(vip only)!'
            })
        } else {
            console.log("API:" + api_url + "error:" + err.stack);
            failHandler(res, "API:" + api_url + " error:" + err.stack)
        }
    }
}

function get3MonthBefore() {
    var resultDate, year, month, date, hms;
    var currDate = new Date();
    year = currDate.getFullYear();
    month = currDate.getMonth() + 1;
    date = currDate.getDate();
    hms = currDate.getHours() + ':' + currDate.getMinutes() + ':' + (currDate.getSeconds() < 10 ? '0' + currDate.getSeconds() : currDate.getSeconds());
    switch (month) {
        case 1:
        case 2:
        case 3:
            month += 9;
            year--;
            break;
        default:
            month -= 3;
            break;
    }
    month = (month < 10) ? ('0' + month) : month;

    resultDate = year + '-' + month + '-' + date + ' ' + hms;
    return new Date(resultDate);
}

function getDateTime() {
    var date = new Date();
    var time_string = '';
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    time_string = time_string + year + month + day;
    return time_string;
}

function qWaitChange(qFn, checkFn, timeout, gap) {
    timeout = timeout || 5000
    gap = gap || 100
    return co(function*() {
        var cur
        for (var i = 0; i * 50 < timeout; ++i) {
            yield new Promise((resolve, reject) => {
                setTimeout(() => resolve(), gap)
            })
            cur = yield qFn()
            if (checkFn(cur)) {
                return cur
            }
        }
        return cur
    })
}

function transcode(data, type) {
    if (data instanceof Array) {
        return data.map(item => _transcode(item, type))
    } else {
        return _transcode(data, type)
    }
}

function _transcode(data, type) {
    if (data === null) {
        return data
    } else if (type === 'int' || type === 'long' || type === "int8") {
        return parseInt(data)
    } else if (type === 'float' || type === 'double') {
        return parseFloat(data)
    } else {
        return data
    }
}

var map_address = {
    "500101": "万州市",
    "500102": "涪陵区",
    "500103": "渝中区",
    "500104": "大渡口区",
    "500105": "江北区",
    "500106": "沙坪坝区",
    "500107": "九龙坡区",
    "500108": "南岸区",
    "500109": "北碚区",
    "500112": "渝北区",
    "500113": "巴南区",
    "500114": "黔江区",
    "500115": "长寿区",
    "500117": "合川区",
    "500118": "永川市",
    "500119": "南川区",
    "500153": "北部新区",
    "500222": "綦江县",
    "500223": "潼南县",
    "500226": "荣昌区",
    "500227": "璧山县",
    "500228": "梁平县",
    "500232": "武隆县",
    "500235": "云阳县",
    "500237": "巫山县",
    "500242": "酉阳县"
}

module.exports = {
    'failHandler': failHandler,
    'apiErrorHandlerGen': apiErrorHandlerGen,
    'getSessionOwner': getSessionOwner,
    'http_get': get_request,
    'int2mac': int2mac,
    'complete': complete,
    'readKey': readKey,
    'checkNecessary': checkNecessary,
    'checkAllKeys': checkAllKeys,
    'getUsefulKeys': getUsefulKeys,
    'require_param': require_param,
    'check_response': check_response,
    'db_op_callback': db_op_callback,
    'censor_encrypt': censor_encrypt,
    'get_err_msg': get_err_msg,
    'mac_dec_hex': mac_dec_hex,
    'check_oa_user': check_oa_user,
    'get3MonthBefore': get3MonthBefore,
    'getDateTime': getDateTime,
    'getSessionSpecialOwner': getSessionSpecialOwner,
    'get_tags_from_pg': get_tags_from_pg,
    'map_address': map_address,
    'qWaitChange': qWaitChange,
    'transcode': transcode
};