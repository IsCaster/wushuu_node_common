var db_module = require('../lib/db');
var table_module = require('../lib/table');
var assert = require('assert')
var should = require('should');


var tableTest = mdb => {
    var used_keys = []

    function save_used_key(keys) {
        if (keys.constructor === Array) {
            used_keys = used_keys.concat(keys)
        } else {
            used_keys.push(keys)
        }
    }

    describe('[ DAO/table.js (' + mdb + ') ]', function() {
        var db;
        before(function(done) {
            var DB = require('../lib/' + mdb + '_db').DB
            db = new DB();
            db.q_connect().then(function() {
                console.log('memory db connected')
                done();
            })
        });
        it('TABLE_TYPE simple', function(done) {
            var apMac = 1231231234
            var ap_up_down_flow = 'ap:' + apMac + ':up.down.flow';
            var op = new table_module.TABLE_TYPE(db, ap_up_down_flow, 'string', 'simple');
            var store_obj = {
                'up_flow': 11.11,
                'down_flow': 10
            }
            save_used_key(op.key)
            op.set(JSON.stringify(store_obj)).then(() =>
                op.get()
            ).then(value => value.should.equal(JSON.stringify(store_obj))).then(() =>
                done()
            ).catch(err => done(err))
        })
        it('TABLE_TYPE zset', function(done) {
            var op = new table_module.TABLE_TYPE(db, "test:table:zset:string", 'string', 'zset');
            var values = ["Firday", "node_ads_backend", "documentation", "balabalabala....", "foobaa", "donald trump",
                "江湖上所以尊称我一声『郭大侠』，实因敬我为国为民、奋不顾身的助守襄阳。 然我才力有限，\
        不能为民解困，实在愧当『大侠』两字。 只盼你心头牢牢记着"
            ]
            var scores = [1, 2, 3, 41, 5, -9, 1399]
            save_used_key(op.key)
            Promise.all(values.map((value, index) => op.set(value, scores[index]))).then(() =>
                op.get()
            ).then(dlist => {
                dlist.length.should.equal(values.length)
                dlist.forEach(data => {
                    values.indexOf(data).should.be.above(-1)
                })
                dlist[0].should.equal(values[5])
                dlist[5].should.equal(values[3])
                dlist[6].should.equal(values[6])
            }).then(() =>
                op.get(2, 5)
            ).then(dlist => {
                dlist.length.should.equal(3)
                dlist.indexOf(values[1]).should.be.above(-1)
                dlist.indexOf(values[2]).should.be.above(-1)
                dlist.indexOf(values[4]).should.be.above(-1)
            }).then(() =>
                op.rm(values[1])
            ).then(() =>
                op.get()
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

        it('TABLE_TYPE hset', function(done) {
            var op = new table_module.TABLE_TYPE(db, "test:table:hset:string", 'string', 'hset');
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
            save_used_key(op.key)
            Promise.all(fields.map((field, index) => op.set(field, values[index]))).then(() =>
                op.get()
            ).then(dlist => {
                dlist.length.should.equal(fields.length)
                dlist.forEach(data => {
                    fields.indexOf(data.field).should.be.above(-1)
                    values[fields.indexOf(data.field)].should.equal(data.value)
                })
                done()
            }).catch(err => done(err))
        })

        it('TABLE_TYPE test not match data type', function(done) {
            var key = 'test.int';
            var op = new table_module.TABLE_TYPE(db, key, 'int', 'simple');
            save_used_key(op.key)
            op.set(2.2).then(() =>
                op.get()
            ).then(value => {
                assert.equal(2, value)
            }).then(() =>
                done()
            ).catch(err => done(err))
        })
        it('TABLE_TYPE test not match data type', function(done) {
            var key = 'test.float';
            var op = new table_module.TABLE_TYPE(db, key, 'float', 'simple');
            save_used_key(op.key)
            op.set(Math.pow(2, 63) - 1).then(() =>
                op.get()
            ).then(value => {
                assert.equal(Math.pow(2, 63) - 1, value)
            }).then(() =>
                done()
            ).catch(err => done(err))
        })


        it("clear up, remove used keys", function(done) {
            Promise.all(used_keys.map(key => db.rmK(key))).then(() => done()).catch(err => done(err))
        })
    })
}

//["tair", "redis"].forEach(tableTest)
["redis"].forEach(tableTest)