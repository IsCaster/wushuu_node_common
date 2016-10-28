var orm = require('orm')
var fs = require('fs')
var pg = require('pg')
var moment = require('moment');
var co = require('co')
var promisify = require("bluebird").promisify

/*var define_tables = function(con) {
    var Goods = con.define('goods', {
        id: {
            type: 'serial',
            key: true
        },
        name: {
            type: 'text'
        }, //商品名
        owner: {
            type: 'integer',
            size: 4
        }, //商户id
        imageUrl: {
            type: 'text'
        }, //图片地址
        available_number: {
            type: 'integer',
            size: 4
        }, //库存
        sales_number: {
            type: 'number',
            size: 4
        }, //已出售的数量
        price_origin: {
            type: 'number',
            size: 4
        }, //原价
        price_true: {
            type: 'integer',
            size: 4
        }, //现价
        category: {
            type: 'integer',
            size: 4
        }, //商品类型
        notice: {
            type: 'text'
        }, //提示信息
        buy_detail: {
            type: 'text'
        }, //购买详情
        describe: {
            type: 'text'
        }, //描述
        isReturnAnytime: {
            type: 'integer',
            size: 2
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var Ap = con.define('ap_v2', {
        id: {
            type: 'serial',
            key: true
        },
        mac: {
            type: 'text'
        }, //Mac地址
        shopId: {
            type: 'integer',
            size: 4
        }, //ap所属店铺
        type: {
            type: 'text'
        }, //ap的型号
        authcode: {
            type: 'text'
        }, //Ap授权码
        ssid: {
            type: 'text'
        }, //ApSSID
        openid: {
            type: 'text'
        }, //apopenid
        owner: {
            type: 'integer'
        },
        alias: {
            type: 'text'
        },
        code: {
            type: 'integer',
            size: 4
        }, //商铺城市ID
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var Ap_sync_info = con.define('ap_sync_info', {
        id: {
            type: 'serial',
            key: true
        },
        shopId: {
            type: 'integer',
            size: 4
        }, //ap所属店铺
        ssid: {
            type: 'text'
        }, //ApSSID
        portal_url: {
            type: 'text'
        },
        encrypt: {
            type: 'integer'
        },
        encrypt_algorithm: {
            type: 'integer'
        },
        encrypt_key: {
            type: 'text'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });
    var Coupon = con.define('coupon', {
        id: {
            type: 'serial',
            key: true
        },
        title: {
            type: 'text'
        }, //标题
        describe: {
            type: 'text'
        }, //描述
        startTime: {
            type: 'text'
        }, //开始时间
        endTime: {
            type: 'text'
        }, //结束时间
        type: {
            type: 'text'
        }, //优惠卷类型
        isAllow: {
            type: 'integer'
        }, //是否允许使用
        isUsed: {
            type: 'integer'
        },
        imageUrl: {
            type: 'text'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var User = con.define('users', {
        id: {
            type: 'serial',
            key: true
        },
        name: {
            type: 'text'
        }, //用户姓名
        registTime: {
            type: 'integer'
        }, //注册时间
        phone: {
            type: 'text'
        }, //电话
        account: {
            type: 'text'
        }, //账户名
        password: {
            type: 'text'
        }, //密码 加密后
        gender: {
            type: 'integer',
            size: 2
        }, //性别
        isVip: {
            type: 'integer',
            size: 2
        }, //是否为商城VIP
        mac: {
            type: 'integer',
            size: 8
        },
        lastlogintime: {
            type: 'integer',
        },
        lastloginip: {
            type: 'text',
        },
        iswblist: {
            type: 'integer',
            size: 2
        }
    }, {
        cache: false
    });

    var users_count = con.define('users_count', {
        id: {
            type: 'serial',
            key: true
        },
        num: {
            type: "text",
        },
        mall_id: {
            type: 'integer'
        },
        date: {
            type: "text"
        }
    }, {
        cache: false
    })

    var ap_count = con.define('ap_count', {
        id: {
            type: 'serial',
            key: true
        },
        num: {
            type: "text",
        },
        mall_id: {
            type: 'integer'
        },
        date: {
            type: "text"
        }
    }, {
        cache: false
    })

    var ap_statistic = con.define('ap_statistic', {
        id: {
            type: 'serial',
            key: true
        },
        mall_id: {
            type: 'integer'
        },
        data: {
            type: 'text'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    })

    //vip到店提醒
    var vip_notification = con.define('vip_notification', {
        id: {
            type: 'serial',
            key: true
        },
        user_id: {
            type: 'integer',
            size: 4
        },
        shopId: {
            type: 'integer'
        },
        mall_id: {
            type: 'integer'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });


    //vip到店提醒
    var WA_BASIC_FJ_0001 = con.define('WA_BASIC_FJ_0001', {
        Id: {
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
            type: 'integer'
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
        },
        place_to_ap: {
            type: 'integer',
        }
    }, {
        cache: false,
    });

    //广告主
    var owner = con.define('ad_owner', {
        id: {
            type: 'serial',
            key: true
        },
        name: {
            type: 'text'
        }, //用户姓名
        'user_name': {
            type: 'text'
        }, //账户
        'password': {
            type: 'text'
        }, //密码
        'balance': {
            type: 'number',
            size: 8
        }, //余额
        'regist_date': {
            type: 'text'
        }, //注册时间
        'type': {
            type: 'text'
        }, //用户类型
        'last_login_time': {
            type: 'integer',
            size: 8
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var mall = con.define('mall', {
        id: {
            type: 'serial',
            key: true
        },
        name: {
            type: 'text'
        },
        describe: {
            type: 'text'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    })

    var Shop = con.define('shop', {
        id: {
            type: 'serial',
            key: true
        },
        name: {
            type: 'text'
        }, //商铺名称
        mall_id: {
            type: 'integer',
            size: 4
        }, //店铺所属商圈
        owner: {
            type: 'integer',
            size: 4
        }, //商铺负责人ID
        code: {
            type: 'integer',
            size: 4
        }, //商铺城市ID
        introduction: {
            type: 'text'
        }, //商铺介绍
        address: {
            type: 'text'
        }, //位置信息
        sharp: {
            type: 'text'
        }, //形状描述
        level: {
            type: 'text'
        }, //商铺AP
        imageUrl: {
            type: 'text'
        },
        type: {
            type: 'text'
        },
        contact: {
            type: 'text'
        },
        phone: {
            type: 'text'
        },
        opening_hours: {
            type: 'text'
        },
        longitude: {
            type: 'text'
        },
        latitude: {
            type: 'text'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var notice = con.define('notice', {
        id: {
            type: 'serial',
            key: true
        },
        title: {
            type: 'text'
        }, //商铺名称
        content: {
            type: 'text'
        }, //商铺负责人ID
        date: {
            type: 'integer',
            size: 4
        },
        author: {
            type: 'text'
        }
    }, {
        cache: false
    });

    var owner_special = con.define('ad_owner_special', {
        id: {
            type: 'serial',
            key: true
        },
        name: {
            type: 'text'
        }, //商铺名称
        password: {
            type: 'text'
        }, //商铺负责人ID
        mall_id: {
            type: 'integer',
            size: 4
        },
        priority: {
            type: 'text',
        }, //特权名称
        'last_login_time': {
            type: 'integer',
            size: 8
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var user_flow = con.define('user_flow', {
        id: {
            type: 'serial',
            key: true
        },
        time: {
            type: 'integer',
            size: 4
        },
        num: {
            type: 'integer',
            size: 4
        },
        mall_id: {
            type: 'integer',
            size: 4
        },
        shop_id: {
            type: 'integer',
            size: 4
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var shop_member = con.define('shop_member', {
        id: {
            type: 'serial',
            key: true
        },
        shopId: {
            type: 'integer'
        },
        type: {
            type: 'integer'
        },
        mac: {
            type: 'text'
        },
        mall_id: {
            type: 'integer'
        },
        frequency: {
            type: 'text'
        },

        create_time: {
            type: 'date',
            time: true
        },
        update_time: {
            type: 'date',
            time: true
        },
        recent_time: {
            type: 'date',
            time: true
        },

    }, {
        cache: false,
        hooks: {
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var priority = con.define('priority', {
        id: {
            type: 'serial',
            key: true
        },
        title: {
            type: 'text'
        }, //特权名称
        describe: {
            type: 'text'
        } //描述特权
    }, {
        cache: false
    });

    var portal_image = con.define('portal_image', {
        id: {
            type: 'serial',
            key: true
        },
        shopId: {
            type: 'integer'
        },
        url: {
            type: 'text'
        },
        mall_id: {
            type: 'integer'
        },
        space: {
            type: 'integer'
        },
        status: {
            type: 'integer'
        },
        censor_id: {
            type: 'integer'
        },
        valid: {
            type: 'integer'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var ap_wblist = con.define('ap_wblist', {
        id: {
            type: 'serial',
            key: true
        },
        shopId: {
            type: 'integer'
        },
        type: {
            type: 'integer'
        },
        mac: {
            type: 'text'
        }
    }, {
        cache: false
    });

    var tags_define = con.define('tags_define', {
        id: {
            type: 'serial',
            key: true
        },
        tag_name: {
            type: 'text'
        },
        tag_id: {
            type: 'integer'
        },
        tag_group: {
            type: 'integer'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var acl_roles = con.define('acl_roles', {
        id: {
            type: 'serial',
            key: true
        },
        'owner': {
            type: 'integer'
        },
        'type': {
            type: 'text'
        },
        'level': {
            type: 'integer'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var acl_permission = con.define('acl_permission', {
        id: {
            type: 'serial',
            key: true
        },
        'type': {
            type: 'text'
        },
        'level': {
            type: 'integer'
        },
        'action': {
            type: 'text'
        },
        'param': {
            type: 'text'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var user_arrive = con.define('user_arrive', {
        id: {
            type: 'serial',
            key: true
        },
        'mall_id': {
            type: 'integer'
        },
        'shopId': {
            type: 'integer'
        },
        'user_id': {
            type: 'integer'
        },
        'arrive_time': {
            type: 'date'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var transaction_record = con.define('transaction_record', {
        id: {
            type: 'serial',
            key: true
        },
        'owner': {
            type: 'integer'
        },
        'type': {
            type: 'text'
        },
        'change': {
            type: 'number'
        },
        'check_str': {
            type: 'text'
        },
        'remark': {
            type: 'text'
        },
        'mall_id': {
            type: 'integer'
        },
        'transaction_time': {
            type: 'date',
            time: true
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var owner_change = con.define('owner_change', {
        id: {
            type: 'serial',
            key: true
        },
        'owner': {
            type: 'integer'
        },
        'tr_id': {
            type: 'integer'
        },
        'type': {
            type: 'text'
        },
        'pre': {
            type: 'number'
        },
        'change': {
            type: 'number'
        },
        'after': {
            type: 'number'
        },
        'remark': {
            type: 'text'
        },
        'mall_id': {
            type: 'integer'
        },
        'check_str': {
            type: 'text'
        },
        'transaction_time': {
            type: 'date',
            time: true
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var fund_queue = con.define('fund_queue', {
        id: {
            type: 'serial',
            key: true
        },
        'owner': {
            type: 'integer'
        },
        'type': {
            type: 'text'
        },
        'change': {
            type: 'number'
        },
        'remark': {
            type: 'text'
        },
        'mall_id': {
            type: 'integer'
        },
        'transaction_time': {
            type: 'date',
            time: true
        },
        'checked': {
            type: 'integer'
        },
        'code': {
            type: 'integer' //0代表尚未发生资金变动或变动失败，1代表变动成功，-1代表余额不足
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var mall_income_record = con.define('mall_income_record', {
        id: {
            type: 'serial',
            key: true
        },
        'owner': {
            type: 'integer'
        },
        'type': {
            type: 'text'
        },
        'income': {
            type: 'number'
        },
        'remark': {
            type: 'text'
        },
        'mall_id': {
            type: 'integer'
        },
        'check_str': {
            type: 'text'
        },
        'transaction_time': {
            type: 'date',
            time: true
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    var ads_engine = con.define('ads_engine', {
        id: {
            type: 'serial',
            key: true
        },
        'name': {
            type: 'text'
        },
        'desc': {
            type: 'text'
        },
        'weight': {
            type: 'integer'
        },
        valid: {
            type: 'integer'
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
            beforeSave: function() {
                this.update_time = new Date();
            },
            beforeCreate: function() {
                this.create_time = new Date();
            },
        },
        methods: {
            serialize: function() {
                return {
                    body: this.body,
                    create_time: moment(this.create_time).fromNow(),
                    update_time: moment(this.update_time).fromNow()
                }
            }
        }
    });

    return {
        "mall.goods": Goods,
        "ap_v2": Ap,
        "User": User,
        "users_count": users_count,
        "ap_count": ap_count,
        "ap_statistic": ap_statistic,
        "mall.shop": Shop,
        "mall.coupon": Coupon,
        "ad.owner": owner,
        "mall": mall,
        "notice": notice,
        "user_flow": user_flow,
        "shop_member": shop_member,
        "ap.sync.info": Ap_sync_info,
        'ad.owner.special': owner_special,
        'ap.portal.image': portal_image,
        'ap.wblist': ap_wblist,
        'tags_define': tags_define,
        "acl_roles": acl_roles,
        "acl_permission": acl_permission,
        "vip_notification": vip_notification,
        "WA_BASIC_FJ_0001": WA_BASIC_FJ_0001,
        'user_arrive': user_arrive,
        'transaction_record': transaction_record,
        'owner_change': owner_change,
        'fund_queue': fund_queue,
        'mall_income_record': mall_income_record,
        'ads_engine': ads_engine
    }
}*/

var g_db = null
var q_db_sync = () => {
    throw new Error("pgsql not initailized yet!")
}
var g_tables = {}


function init(pg_conn_str) {
    return co(function*() {
        var q_orm_connect = promisify(orm.connect, {
            context: orm
        })
        console.log("_init() call q_orm_connect()")
        g_db = yield q_orm_connect(pg_conn_str)
        q_db_sync = promisify(g_db.sync, {
            context: g_db
        })
    }).catch(function(err) {
        console.error("initdb() err=" + err.stack || err)
        throw err
    })
}

function getTables() {
    return g_tables
}

function defineTable(exportName, conf) {
    conf.name = conf.name || exportName
    var params = transformConf(conf)
    var newTable = g_db.define(...params)
    g_tables[exportName] = newTable
    return newTable
}

function registerTable(exportName, conf) {
    var newTable = defineTable(exportName, conf)
    var syncTable = promisify(newTable.sync, {
        context: newTable
    })
    return syncTable()
}


function transformConf(conf) {
    var params = []
    params[0] = conf.name
    params[1] = {}
    params[1].id = {
        type: 'serial',
        key: true
    }
    conf.attr.map(a => {
        params[1][a.key] = {}
        if (a.type === "int") {
            params[1][a.key].type = 'integer'
            params[1][a.key].size = a.size || 8
        } else if (a.type === "string" || a.type === "text") {
            params[1][a.key].type = 'text'
        } else if (a.type === "date") {
            params[1][a.key].type = 'date'
            params[1][a.key].time = true
        } else if (a.type === "double" || a.type === "float" || a.type === "number") {
            params[1][a.key].type = 'number'
            params[1][a.key].size = a.size || 8
        }
    })
    params[2] = {}
    params[2].cache = false
    if (conf.timestamp) {
        params[1].create_time = {
            type: 'date',
            time: true
        }
        params[1].update_time = {
            type: 'date',
            time: true
        }
        params[2].hooks = {
            beforeSave: () => {
                this.update_time = new Date()
            },
            beforeCreate: () => {
                this.create_time = new Date()
            }
        }
        params[2].methods = {
            serialize: () => ({
                body: this.body,
                create_time: moment(this.create_time).fromNow(),
                update_time: moment(this.update_time).fromNow()
            })
        }
    }
    return params
}

function sync() {
    return q_db_sync()
}

module.exports.init = init
module.exports.getTables = getTables
module.exports.registerTable = registerTable
module.exports.defineTable = defineTable
module.exports.sync = sync