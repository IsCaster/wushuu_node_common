var should = require('should');

var MDBTest = mdb => {
    describe('[ DAO/db.js (' + mdb + ') ]', function() {
        var db
        var used_keys = []

        function save_used_key(keys) {
            if (keys.constructor === Array) {
                keys.forEach(key => _save_used_key(key))
            } else {
                _save_used_key(keys)
            }
        }

        function _save_used_key(key) {
            if (used_keys.indexOf(key) === -1) {
                used_keys.push(key)
            }
        }

        before(function(done) {
            var DB = require('../lib/' + mdb + '_db').DB
            db = new DB();
            db.q_connect().then(function() {
                console.log('memory db connected')
                done();
            }).catch(err => done(err))
        })

        it('setKV, string', function(done) {
            var key = "test_key_string"
            var value = "test_value"
            save_used_key(key)
            db.setKV(key, value).then(() => {
                return db.getV(key)
            }).then(data => {
                value.should.equal(data)
                done()
            }).catch(err => done(err))
        })
        it('getV, empty key', function(done) {
            var key = "test_empty_string_key"
            db.getV(key)
                .then(value => should(value).be.exactly(null))
                .then(() => db.getV(key, "int"))
                .then(value => should(value).be.exactly(null))
                .then(() => db.rmK(key))
                .then(value => value.should.equal(0))
                .then(() => done())
                .catch(done)
        })
        it('setKV, int', function(done) {
            var key = "test_key_int"
            var value = 987654321
            save_used_key(key)
            db.setKV(key, value, "int").then(() => {
                return db.getV(key, "int")
            }).then(data => {
                value.should.equal(data)
                done()
            }).catch(err => done(err))
        })
        it('setKV, float', function(done) {
            var key = "test_key_float"
            var value = 98765.4321
            save_used_key(key)
            db.setKV(key, value, "float").then(() => {
                return db.getV(key, "float")
            }).then(data => {
                value.should.equal(data)
                done()
            }).catch(err => done(err))
        })
        it('setSV, string', function(done) {
            var key = "test_set_key_string"
            var values = ["Firday", "node_ads_backend", "documentation", "balabalabala...."]
            var new_value = "江湖上所以尊称我一声『郭大侠』，实因敬我为国为民、奋不顾身的助守襄阳。 然我才力有限，\
        不能为民解困，实在愧当『大侠』两字。 只盼你心头牢牢记着"
            save_used_key(key)
            db.setSV(key, values).then(() => {
                return db.setSV(key, new_value)
            }).then(() => {
                return db.getSV(key)
            }).then(dlist => {
                values.push(new_value)
                dlist.length.should.equal(values.length)
                dlist.forEach(data => {
                    values.indexOf(data).should.be.above(-1)
                })
            }).then(() =>
                db.rmSV(key, values[3])
            ).then(() =>
                db.getSV(key)
            ).then(dlist => {
                dlist.length.should.equal(values.length - 1)
                values.forEach((value, index) => {
                    if (index != 3) {
                        dlist.indexOf(value).should.be.above(-1)
                    } else {
                        dlist.indexOf(value).should.equal(-1)
                    }
                })
                done()
            }).catch(err => done(err))
        })

        it('setSV, number, int', function(done) {
            var key = "test_set_key_int"
            var values = [1, 3, 9, 1280123]
            var new_value = 4
            save_used_key(key)
            db.setSV(key, values, "int").then(() => {
                return db.setSV(key, new_value, "int")
            }).then(() => {
                return db.getSV(key, "int")
            }).then(dlist => {
                values.push(new_value)
                console.log("db.getSV() dlist=" + dlist + ",values=" + values)
                dlist.length.should.equal(values.length)
                dlist.forEach(data => {
                    values.indexOf(data).should.be.above(-1)
                })
            }).then(() =>
                db.rmSV(key, values[3], "int")
            ).then(() =>
                db.getSV(key, "int")
            ).then(dlist => {
                dlist.length.should.equal(values.length - 1)
                values.forEach((value, index) => {
                    if (index != 3) {
                        dlist.indexOf(value).should.be.above(-1)
                    } else {
                        dlist.indexOf(value).should.equal(-1)
                    }
                })
                done()
            }).catch(err => done(err))
        })

        it('setSV, number, float', function(done) {
            var key = "test_set_key_float"
            var values = [1.0, 3.81237, 9000.123, 128012.3]
            var new_value = 4.4234
            save_used_key(key)
            db.setSV(key, values, "float").then(() => {
                return db.setSV(key, new_value)
            }).then(() => {
                return db.getSV(key, "float")
            }).then(dlist => {
                values.push(new_value)
                console.log("db.getSV() dlist=" + dlist + ",values=" + values)
                dlist.length.should.equal(values.length)
                dlist.forEach(data => {
                    values.indexOf(data).should.be.above(-1)
                })
            }).then(() =>
                db.rmSV(key, values[3], "float")
            ).then(() =>
                db.getSV(key, "float")
            ).then(dlist => {
                dlist.length.should.equal(values.length - 1)
                values.forEach((value, index) => {
                    if (index != 3) {
                        dlist.indexOf(value).should.be.above(-1)
                    } else {
                        dlist.indexOf(value).should.equal(-1)
                    }
                })
                done()
            }).catch(err => done(err))

        })

        it('getSV, none exist key', function(done) {
            var key = "none exist key"
            db.getSV(key).then(dlist => {
                dlist.length.should.equal(0)
                done()
            }).catch(err => done(err))
        })

        it('setZV, string', function(done) {
            var key = "test_zset_key_string"
            var values = ["Firday", "node_ads_backend", "documentation", "balabalabala....", "foobaa", "donald trump",
                "江湖上所以尊称我一声『郭大侠』，实因敬我为国为民、奋不顾身的助守襄阳。 然我才力有限，\
        不能为民解困，实在愧当『大侠』两字。 只盼你心头牢牢记着"
            ]
            var scores = [1, 2, 3, 41, 5, -9, 1399]
            save_used_key(key)
            Promise.all(values.map((value, index) => db.setZV(key, value, scores[index]))).then(() =>
                db.getZV(key)
            ).then(dlist => {
                dlist.length.should.equal(values.length)
                dlist.forEach(data => {
                    values.indexOf(data).should.be.above(-1)
                })
                dlist[0].should.equal(values[5])
                dlist[5].should.equal(values[3])
                dlist[6].should.equal(values[6])
            }).then(() =>
                db.getZV(key, undefined, 2, 5)
            ).then(dlist => {
                dlist.length.should.equal(3)
                dlist.indexOf(values[1]).should.be.above(-1)
                dlist.indexOf(values[2]).should.be.above(-1)
                dlist.indexOf(values[4]).should.be.above(-1)
            }).then(() =>
                db.rmZV(key, values[1])
            ).then(() =>
                db.getZV(key)
            ).then(dlist => {
                dlist.length.should.equal(values.length - 1)
                values.forEach((value, index) => {
                    if (index != 1) {
                        dlist.indexOf(value).should.be.above(-1)
                    } else {
                        dlist.indexOf(value).should.equal(-1)
                    }
                })
                done()
            }).catch(err => done(err))
        })

        it('error handling, wrong key type 1', function(done) {
            var key = "str_key_error_handling"
            save_used_key(key)
            db.setKV(key, "fooooooooo").then(() =>
                db.setZV(key, "asdfadsf", 123123)
            ).then(() =>
                done(new Error("Should return a error"))
            ).catch(err => {
                console.log("error handling, wrong key type 1, err=" + err.stack || err)
                err.message.should.equal("WRONGTYPE Operation against a key holding the wrong kind of value")
                done()
            }).catch(done)
        })

        it('error handling, wrong key type 2', function(done) {
            var key = "set_key_error_handling"
            save_used_key(key)
            db.setSV(key, "asdfds12").then(() =>
                db.setZV(key, "asdfadsf", 123123)
            ).then(() =>
                done(new Error("Should return a error"))
            ).catch(err => {
                err.message.should.equal("WRONGTYPE Operation against a key holding the wrong kind of value")
                done()
            })
        })

        it('set, error handling', function(done) {
            var key = "set_key_error_handling"
            save_used_key(key)
            db.setSV(key, 123)
                .then(number => number.should.equal(1))
                .then(() => db.setSV(key, 456))
                .then(number => number.should.equal(1))
                .then(() => db.setSV(key, 123))
                .then(number => number.should.equal(0))
                .then(() => done())
                .catch(done)
        })

        it('zset, error handling', function(done) {
            var key = "zet_key_error_handling"
            save_used_key(key)
            db.setZV(key, "one", 123)
                .then(number => number.should.equal(1))
                .then(() => db.setZV(key, "two", 456))
                .then(number => number.should.equal(1))
                .then(() => db.setZV(key, "one", 123))
                .then(number => number.should.equal(0))
                .then(() => db.setZV(key, "one", 124))
                .then(number => number.should.equal(0))
                .then(() => done())
                .catch(done)
        })

        it('setZV, int', function(done) {
            var key = "test_zset_key_int"
            var values = [10001, 10004, 10008, 10009, 11009, 98, 14]
            var scores = [1, 2, 3, 41, 5, -9, 1399]
            save_used_key(key)
            Promise.all(values.map((value, index) => db.setZV(key, value, scores[index], "int"))).then(() =>
                db.getZV(key, "int")
            ).then(dlist => {
                dlist.length.should.equal(values.length)
                console.log("setZV, int, dlist =" + dlist)
                dlist.forEach(data => {
                    values.indexOf(data).should.be.above(-1)
                })
            }).then(() =>
                db.getZV(key, "int", 2, 5)
            ).then(dlist => {
                dlist.length.should.equal(3)
                dlist.indexOf(values[1]).should.be.above(-1)
                dlist.indexOf(values[2]).should.be.above(-1)
                dlist.indexOf(values[4]).should.be.above(-1)
            }).then(() =>
                db.getZV(key, "int", 2, 5, 0, 2)
            ).then(dlist => {
                dlist.length.should.equal(2)
                dlist.indexOf(values[1]).should.be.above(-1)
                dlist.indexOf(values[2]).should.be.above(-1)
            }).then(() =>
                db.rmZV(key, values[4], "int")
            ).then(() =>
                db.getZV(key, "int")
            ).then(dlist => {
                dlist.length.should.equal(values.length - 1)
                values.forEach((value, index) => {
                    if (index != 4) {
                        dlist.indexOf(value).should.be.above(-1)
                    } else {
                        dlist.indexOf(value).should.equal(-1)
                    }
                })
                done()
            }).catch(err => done(err))
        })

        it('setZV, float', function(done) {
            var key = "test_zset_key_float"
            var values = [100.01, 10004, 10008.1230014, 10.009, 110.09, 98, 142234.123]
            var scores = [1, 2, 3, 41, 5, -9, 1399]
            save_used_key(key)
            Promise.all(values.map((value, index) => db.setZV(key, value, scores[index], "float"))).then(() => {
                return db.getZV(key, "float")
            }).then(dlist => {
                dlist.length.should.equal(values.length)
                console.log("setZV, float, dlist =" + dlist)
                dlist.forEach(data => {
                    values.indexOf(data).should.be.above(-1)
                })
            }).then(() =>
                db.getZV(key, "float", 2, 5)
            ).then(dlist => {
                dlist.length.should.equal(3)
                dlist.indexOf(values[1]).should.be.above(-1)
                dlist.indexOf(values[2]).should.be.above(-1)
                dlist.indexOf(values[4]).should.be.above(-1)
            }).then(() =>
                db.getZV(key, "float", 2, 5, 1, 2)
            ).then(dlist => {
                dlist.length.should.equal(2)
                dlist.indexOf(values[2]).should.be.above(-1)
                dlist.indexOf(values[4]).should.be.above(-1)
            }).then(() =>
                db.rmZV(key, values[4], "float")
            ).then(() =>
                db.getZV(key, "float")
            ).then(dlist => {
                dlist.length.should.equal(values.length - 1)
                values.forEach((value, index) => {
                    if (index != 4) {
                        dlist.indexOf(value).should.be.above(-1)
                    } else {
                        dlist.indexOf(value).should.equal(-1)
                    }
                })
                done()
            }).catch(err => done(err))
        })

        it('incr', function(done) {
            var key = "test_incr_key"
            save_used_key(key)
            db.incr(key).then(() =>
                db.getV(key)
            ).then(value =>
                value.should.equal("1")
            ).then(() =>
                db.incr(key, 10)
            ).then(value =>
                value.should.equal(11)
            ).then(() =>
                db.getV(key)
            ).then(value =>
                value.should.equal("11")
            ).then(() =>
                db.incr(key, 1000)
            ).then(value => {
                value.should.equal(1011)
                done()
            }).catch(err => done(err))
        })

        it('setHSV', function(done) {
            var key = "test_hset_key_string"
            var fields = ["Firday", "node_ads_backend", "documentation", "balabalabala....", "foobaa", "donald trump",
                "江湖上所以尊称我一声『郭大侠』，实因敬我为国为民、奋不顾身的助守襄阳。 然我才力有限，\
        不能为民解困，实在愧当『大侠』两字。 只盼你心头牢牢记着"
            ]
            var values = ["金老為了傳播正能量:妳看人郭破虜", "，根正苗紅的富三代紅二代，混成個啥挫逼樣了？", "所以那些背景說出來嚇死人的，不一定能有出息。",
                "真正有出息的，還是楊過這種祖上成分不好但是...長得好看的。",
                "Home - Waterfall Grid T-Grid Console Builders Recent Builds Buildslaves Changesources - JSON API - About",
                "https://code.wushuu.com/wushuu-ads/node_ads_backend/builds/276",
                "豪车界的“正统”是欧洲，雷克萨斯好比亚洲人到欧美发展，你必须加倍努力才能消除大家的偏见。在中国，\
            雷克萨斯一直进口不国产，而且溢价还很高，自然很难跟ABB正面竞争，销量当然难成主流。雷克萨斯近来在中国推出一些小排量版本，\
            比如ES200、NX200等，倒是能让更多人触手可及。作者：冯晞帆-稀饭链接：https://www.zhihu.com/question/50823687/answer/124334215来源：\
            知乎著作权归作者所有，转载请联系作者获得授权。"
            ]
            save_used_key(key)
            Promise.all(fields.map((field, index) => db.setHSV(key, field, values[index]))).then(() =>
                db.getHSV(key)
            ).then(dlist => {
                dlist.length.should.equal(fields.length)
                dlist.forEach(data => {
                    fields.indexOf(data.field).should.be.above(-1)
                    values[fields.indexOf(data.field)].should.equal(data.value)
                })
                done()
            }).catch(err => done(err))
        })

        if (mdb === "redis") {
            it("should zcard work", done => {
                var key = "test_zcard_key"
                var values = [10001, 10004, 10008, 10009, 11009, 98, 14]
                var scores = [1, 2, 3, 41, 5, -9, 1399]
                save_used_key(key)
                Promise.all(values.map((value, index) => db.setZV(key, value, scores[index], "int")))
                    .then(() => db.zcard(key))
                    .then(count => {
                        count.should.be.equal(7)
                        done()
                    }).catch(done)
            })

            it("should zcount work", done => {
                var key = "test_zcount_key"
                var values = [100.01, 10004, 10008.1230014, 10.009, 110.09, 98, 142234.123]
                var scores = [1, 2, 3, 41, 5, -9, 1399]
                save_used_key(key)
                Promise.all(values.map((value, index) => db.setZV(key, value, scores[index], "float")))
                    .then(() => db.zcount(key, -9, 5))
                    .then(count => {
                        count.should.be.equal(5)
                        done()
                    }).catch(done)
            })
            it("should scard work", done => {
                var key = "test_scard_key"
                var values = ["Firday", "node_ads_backend", "documentation", "balabalabala....",
                    "江湖上所以尊称我一声『郭大侠』，实因敬我为国为民、奋不顾身的助守襄阳。 然我才力有限，不能为民解困，实在愧当『大侠』两字。 只盼你心头牢牢记着"
                ]
                save_used_key(key)
                db.setSV(key, values)
                    .then(() => db.scard(key))
                    .then(count => {
                        count.should.be.equal(values.length)
                        done()
                    }).catch(done)
            })
        }

        it("clear up, remove used keys", function(done) {
            Promise.all(used_keys.map(key => db.rmK(key)))
                .then(retList => {
                    retList.every(ret => ret === 1).should.equal(true)
                    done()
                }).catch(err => done(err))
        })
    })
}

//["tair", "redis"].forEach(MDBTest)
["redis"].forEach(MDBTest)