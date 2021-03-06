var should = require('should')
var rewire = require('rewire')
var pgsqlConf = rewire('../lib/orm/pgsql.db.config')
var moment = require('moment')
var objectEquals = require('../lib/utils').objectEquals
var pg_conf = {
    'host': 'pg',
    'port': 5432,
    'user': 'wushuu',
    'pass': 'woyoadmin',
    'db': 'citic'
}
var pg_conn_str = "postgres://" + pg_conf.user + ":" + pg_conf.pass + "@" + pg_conf.host + "/" + pg_conf.db;



describe('[ DAO/orm/pgsql ]', function() {
    var TestTable
    before(function(done) {
        pgsqlConf.init(pg_conn_str).then(done)
    })

    var transformConf = pgsqlConf.__get__("transformConf")
    it('transformConf with timestamp', function(done) {
        var conf = {
            "name": "goods",
            "type": "simple",
            "attr": [{
                "key": "owner",
                "default": -1,
                "type": "int"
            }, {
                "key": "name",
                "default": "",
                "type": "string"
            }, {
                "key": "describe",
                "default": "",
                "type": "string"
            }, {
                "key": "imageUrl",
                "default": "",
                "type": "string"
            }, {
                "key": "category",
                "default": -1,
                "type": "int"
            }, {
                "key": "price_origin",
                "default": "0",
                "type": "float"
            }, {
                "key": "price_true",
                "default": "0",
                "type": "double"
            }, {
                "key": "notice",
                "default": "",
                "type": "string"
            }, {
                "key": "buy_detail",
                "default": "",
                "type": "string"
            }, {
                "key": "isReturnAnytime",
                "default": 0,
                "type": "int"
            }, {
                "key": "sales_number",
                "default": 0,
                "type": "int"
            }, {
                "key": "available_number",
                "default": 0,
                "type": "int"
            }],
            "set": false,
            "PG": true,
            "timestamp": true
        }

        var expectPgConf = ['goods', {
            id: {
                type: 'serial',
                key: true
            },
            owner: {
                type: 'integer',
                size: 8,
                defaultValue: -1
            },
            name: {
                type: 'text',
                defaultValue: ''
            },
            describe: {
                type: 'text',
                defaultValue: ''
            },
            imageUrl: {
                type: 'text',
                defaultValue: ''
            },
            category: {
                type: 'integer',
                size: 8,
                defaultValue: -1
            },
            price_origin: {
                type: 'number',
                size: 8,
                defaultValue: '0'
            },
            price_true: {
                type: 'number',
                size: 8,
                defaultValue: '0'
            },
            notice: {
                type: 'text',
                defaultValue: ''
            },
            buy_detail: {
                type: 'text',
                defaultValue: ''
            },
            isReturnAnytime: {
                type: 'integer',
                size: 8,
                defaultValue: 0
            },
            sales_number: {
                type: 'integer',
                size: 8,
                defaultValue: 0
            },
            available_number: {
                type: 'integer',
                size: 8,
                defaultValue: 0
            },
            create_time: {
                type: 'date',
                time: true
            },
            update_time: {
                type: 'date',
                time: true
            }
        }, {
            cache: false,
            hooks: {
                beforeSave: () => {
                    this.update_time = new Date()
                },
                beforeCreate: () => {
                    this.create_time = new Date()
                }
            },
            methods: {
                serialize: () => ({
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                })
            }
        }]
        var retConf = transformConf(conf)
        retConf.length.should.equal(3);
        retConf[2].should.have.properties(["cache", "hooks", "methods"])
        retConf[2].cache.should.be.false()
        retConf[2].hooks.should.have.properties(["beforeSave", "beforeCreate"])
        retConf[2].methods.should.have.properties("serialize")
        should(objectEquals(retConf[0], expectPgConf[0])).equal(true)
        should(objectEquals(retConf[1], expectPgConf[1])).equal(true)
        done()
    })

    it('transformConf without timestamp', function(done) {
        var conf = {
            "name": "WA_BASIC_FJ_0001",
            "type": "simple",
            "attr": [{
                "key": "NETBAR_WACODE",
                "type": "string"
            }, {
                "key": "PLACE_NAME",
                "type": "string"
            }, {
                "key": "SITE_ADDRESS",
                "type": "string"
            }, {
                "key": "LONGITUDE",
                "type": "string"
            }, {
                "key": "LATITUDE",
                "type": "string"
            }, {
                "key": "NETSITE_TYPE",
                "type": "string"
            }, {
                "key": "BUSINESS_NATURE",
                "type": "int"
            }, {
                "key": "LAW_PRINCIPAL_NAME",
                "type": "string"
            }, {
                "key": "LAW_PRINCIPAL_CERTIFICATE_TYPE",
                "type": "string"
            }, {
                "key": "LAW_PRINCIPAL_CERTIFICATE_ID",
                "type": "string"
            }, {
                "key": "RELATIONSHIP_ACCOUNT",
                "type": "string"
            }, {
                "key": "START_TIME",
                "type": "string"
            }, {
                "key": "END_TIME",
                "type": "string"
            }, {
                "key": "ACCESS_TYPE",
                "type": "int"
            }, {
                "key": "OPERATOR_NET",
                "type": "string"
            }, {
                "key": "ACSSES_IP",
                "type": "string"
            }, {
                "key": "CODE_ALLOCATION_ORGANIZATION",
                "type": "string"
            }, {
                "key": "MAC",
                "type": "string"
            }, {
                "key": "report_status",
                "type": "int",
                "default": 0
            }, {
                "key": "place_to_ap",
                "type": "int",
                "default": 0
            }],
            "set": false,
            "PG": true
        }

        var expectPgConf = ['WA_BASIC_FJ_0001', {
            id: {
                type: 'serial',
                key: true
            },
            NETBAR_WACODE: {
                type: 'text'
            },
            PLACE_NAME: {
                type: 'text'
            },
            SITE_ADDRESS: {
                type: 'text'
            },
            LONGITUDE: {
                type: 'text'
            },
            LATITUDE: {
                type: 'text'
            },
            NETSITE_TYPE: {
                type: 'text'
            },
            BUSINESS_NATURE: {
                type: 'integer',
                size: 8
            },
            LAW_PRINCIPAL_NAME: {
                type: 'text'
            },
            LAW_PRINCIPAL_CERTIFICATE_TYPE: {
                type: 'text'
            },
            LAW_PRINCIPAL_CERTIFICATE_ID: {
                type: 'text'
            },
            RELATIONSHIP_ACCOUNT: {
                type: 'text'
            },
            START_TIME: {
                type: 'text'
            },
            END_TIME: {
                type: 'text'
            },
            ACCESS_TYPE: {
                type: 'integer',
                size: 8
            },
            OPERATOR_NET: {
                type: 'text'
            },
            ACSSES_IP: {
                type: 'text'
            },
            CODE_ALLOCATION_ORGANIZATION: {
                type: 'text'
            },
            MAC: {
                type: 'text'
            },
            report_status: {
                type: 'integer',
                size: 8,
                defaultValue: 0
            },
            place_to_ap: {
                type: 'integer',
                size: 8,
                defaultValue: 0
            }
        }, {
            cache: false
        }]
        var retConf = transformConf(conf)
        console.log(require("util").inspect(retConf))
        should(objectEquals(retConf[0], expectPgConf[0])).equal(true)
        should(objectEquals(retConf[1], expectPgConf[1])).equal(true)
        should(objectEquals(retConf[2], expectPgConf[2])).equal(true)
        done()
    })

    it('defineTable', function(done) {
        var exportName = "fund_queue"
        var conf = {
            "name": "fund_queue",
            "type": "simple",
            "attr": [{
                "key": "owner",
                "default": 0,
                "type": "int"
            }, {
                "key": "type",
                "default": "",
                "type": "string"
            }, {
                "key": "change",
                "default": 0,
                "type": "double"
            }, {
                "key": "remark",
                "default": "",
                "type": "string"
            }, {
                "key": "mall_id",
                "default": 0,
                "type": "int"
            }, {
                "key": "transaction_time",
                "type": "date"
            }, {
                "key": "checked",
                "default": 0,
                "type": "int"
            }, {
                "key": "code",
                "default": 0,
                "type": "int"
            }],
            "set": false,
            "PG": true,
            "timestamp": true
        }
        pgsqlConf.defineTable(exportName, conf)
        pgsqlConf.getTables().should.have.property(exportName)
        done()
    })

    it('registerTable', function(done) {
        var exportName = "testTable"
        var conf = {
            "name": "testTable",
            "type": "simple",
            "attr": [{
                "key": "owner",
                "default": 0,
                "type": "int"
            }, {
                "key": "type",
                "default": "",
                "type": "string"
            }, {
                "key": "change",
                "default": 0,
                "type": "double"
            }, {
                "key": "remark",
                "default": "",
                "type": "string"
            }, {
                "key": "mall_id",
                "default": 0,
                "type": "int"
            }, {
                "key": "transaction_time",
                "type": "date"
            }, {
                "key": "checked",
                "default": 0,
                "type": "int"
            }, {
                "key": "code",
                "default": 0,
                "type": "float",
                "size": 4
            }],
            "set": false,
            "PG": true,
            "timestamp": true
        }
        pgsqlConf.registerTable(exportName, conf).then(() => {
            pgsqlConf.getTables().should.have.property(exportName)
            var g_db = pgsqlConf.__get__("g_db")
            TestTable = pgsqlConf.getTables()[exportName]
            var newEntry = {
                "owner": 10001,
                "type": "win",
                "change": 999999.9999,
                "transaction_time": new Date()
            }
            TestTable.create(newEntry, err => {
                should.not.exist(err)
                done()
            })
        }).catch(done)
    })

    it('find TestTable', function(done) {
        TestTable.find({
            owner: 10001
        }, function(err, entries) {
            if (err) throw err;
            console.log("TestTable entries found: %d", entries.length);
            var entry = entries.pop()
            console.log("First TestTable entry, owne: %s, type: %s, create_time=%s", entry.owner, entry.type, entry.create_time);
            should(entry.owner).equal(10001)
            should(entry.type).equal("win")
            should.exist(entry.create_time)
            should.exist(entry.update_time)
            entry.create_time.should.be.a.Date()
            entry.update_time.should.be.a.Date()
            done()
        })

    })

    it('drop TestTable', function(done) {
        TestTable.drop(err => {
            should.not.exist(err)
            done()
        })
    })
})