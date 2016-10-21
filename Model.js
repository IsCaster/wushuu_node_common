var winston = require('winston');
var dao_module = require('./DAO');
var db_module = require('./db');
var DAO = dao_module.DAO;
var DAO_OF_SET = dao_module.DAO_OF_SET;
var DAO_OF_PG = dao_module.DAO_OF_PG;
var db = null;
var MODEL_OBJECTS = {};

Model('ad.space', {
    'name': 'ad.space',
    'type': 'simple',
    'attr': [{
        'key': 'desc',
        'default': '',
        'type': 'string'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }],
    'set': false
});

Model('ad.space.group.set', {
    'name': 'ad.space',
    'type': 'zset',
    'key': 'ad.group.set',
    'value': 'int',
    'set': true
});

Model('ad.group', {
    'name': 'ad.group',
    'type': 'simple',
    'attr': [{
        'key': 'owner',
        'default': -1,
        'type': 'int'
    }, {
        'key': 'x',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'y',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'z',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'radius',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'click.price',
        'default': 0,
        'type': 'double'
    }, {
        'key': 'show.price',
        'default': 0,
        'type': 'double'
    }, {
        'key': 'space',
        'default': -1,
        'type': 'int'
    }, {
        'key': 'valid',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'budget',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'market.start',
        'default': 'none',
        'type': 'string'
    }, {
        'key': 'market.end',
        'default': 'none',
        'type': 'string'
    }, {
        'key': 'is_delete',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'market.shop.set',
        'default': 'none',
        'type': 'set',
        'valueType': 'int'
    }, {
        'key': 'target.label.set',
        'default': 'none',
        'type': 'set',
        'valueType': 'string'
    }, {
        'key': 'market.mall.set',
        'default': 'none',
        'type': 'string'
    }],
    'set': false
});

Model('ad.content', {
    'name': 'ad',
    'type': 'simple',
    'attr': [{
        'key': 'group',
        'default': -1,
        'type': 'int'
    }, {
        'key': 'content',
        'default': 'none',
        'type': 'string'
    }, {
        'key': 'jump.url',
        'default': 'none',
        'type': 'string'
    }, {
        'key': 'weight',
        'default': 1,
        'type': 'int'
    }, {
        'key': 'show.counter',
        'default': "0",
        'type': 'string'
    }, {
        'key': 'click.counter',
        'default': "0",
        'type': 'string'
    }, {
        'key': 'valid',
        'default': 1,
        'type': 'int'
    }],
    'set': false
});

Model('notice', {
    'name': 'notice',
    'type': 'simple',
    'attr': [{
        'key': 'content',
        'default': 'none',
        'type': 'string'
    }, {
        'key': 'title',
        'default': 'none',
        'type': 'string'
    }, {
        'key': 'author',
        'default': 'none',
        'type': 'string'
    }, {
        'key': 'date',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
});

Model('User', {
    'name': 'User',
    'type': 'simple',
    'attr': [{
        'key': 'name',
        'default': 0,
        'type': 'string'
    }, {
        'key': 'registTime',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'phone',
        'default': '',
        'type': 'string'
    }, {
        'key': 'account',
        'default': '',
        'type': 'string'
    }, {
        'key': 'password',
        'default': '',
        'type': 'string'
    }, {
        'key': 'gender',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'isVip',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'mac',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'lastlogintime',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'lastloginip',
        'default': '',
        'type': 'text'
    }, {
        'key': 'iswblist',
        'default': 0,
        'type': 'int'
    }],
    'set': false,
    'PG': true
})

Model('users_count', {
    'name': 'users_count',
    'type': 'simple',
    'attr': [{
        'key': 'num',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mall_id',
        'type': 'int'
    }, {
        'key': 'date',
        'default': '',
        'type': 'string'
    }],
    'set': false,
    'PG': true
})

Model('ap_count', {
    'name': 'ap_count',
    'type': 'simple',
    'attr': [{
        'key': 'num',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mall_id',
        'type': 'int'
    }, {
        'key': 'date',
        'default': '',
        'type': 'string'
    }],
    'set': false,
    'PG': true
})

Model('ap_statistic', {
    'name': 'ap_statistic',
    'type': 'simple',
    'attr': [{
        'key': 'mall_id',
        'type': 'int'
    }, {
        'key': 'data',
        'type': 'string'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})

Model('vip_notification', {
    'name': 'vip_notification',
    'type': 'simple',
    'attr': [{
        'key': 'user_id',
        'type': 'int'
    }, {
        'key': 'shopId',
        'type': 'int'
    }, {
        'key': 'mall_id',
        'type': 'int'
    }],
    'set': false,
    'PG': true
})

Model('WA_BASIC_FJ_0001', {
    'name': 'WA_BASIC_FJ_0001',
    'type': 'simple',
    'attr': [{
        'key': 'NETBAR_WACODE',
        'type': 'string'
    }, {
        'key': 'PLACE_NAME',
        'type': 'string'
    }, {
        'key': 'SITE_ADDRESS',
        'type': 'string'
    }, {
        'key': 'LONGITUDE',
        'type': 'string'
    }, {
        'key': 'LATITUDE',
        'type': 'string'
    }, {
        'key': 'NETSITE_TYPE',
        'type': 'string'
    }, {
        'key': 'BUSINESS_NATURE',
        'type': 'int'
    }, {
        'key': 'LAW_PRINCIPAL_NAME',
        'type': 'string'
    }, {
        'key': 'LAW_PRINCIPAL_CERTIFICATE_TYPE',
        'type': 'string'
    }, {
        'key': 'LAW_PRINCIPAL_CERTIFICATE_ID',
        'type': 'string'
    }, {
        'key': 'RELATIONSHIP_ACCOUNT',
        'type': 'string'
    }, {
        'key': 'START_TIME',
        'type': 'string'
    }, {
        'key': 'END_TIME',
        'type': 'string'
    }, {
        'key': 'ACCESS_TYPE',
        'type': 'int'
    }, {
        'key': 'OPERATOR_NET',
        'type': 'string'
    }, {
        'key': 'ACSSES_IP',
        'type': 'string'
    }, {
        'key': 'CODE_ALLOCATION_ORGANIZATION',
        'type': 'string'
    }, {
        'key': 'MAC',
        'type': 'string'
    }, {
        'key': 'report_status',
        'type': 'int',
        'default': 0
    }, {
        'key': 'place_to_ap',
        'type': 'int',
        'default': 0
    }],
    'set': false,
    'PG': true
})


Model('ad.group.shop.set', {
    'name': 'ad.group',
    'type': 'set',
    'key': 'shop.set',
    'value': 'int',
    'set': true
});

Model('ad.group.ad.set', {
    'name': 'ad.group',
    'type': 'set',
    'key': 'ad.set',
    'value': 'int',
    'set': true
});

Model('ad.group.target.label.set', {
    'name': 'ad.group',
    'type': 'set',
    'key': 'target.label.set',
    'value': 'string',
    'set': true
});

Model('ad.location.ad.group.set', {
    'name': 'ad.location',
    'type': 'zset',
    'key': 'ad.group.set',
    'value': 'int',
    'set': true
});
Model('ad.group.time.range.list', {
    'name': 'ad.group',
    'type': 'set',
    'key': 'time.range.list',
    'value': 'buffer',
    'set': true
});


Model('user.mac.label.set_bak', {
    'name': 'user',
    'type': 'set',
    'key': 'label.set_bak',
    'value': 'string',
    'set': true
});

Model('user.mac.label.set', {
    'name': 'user',
    'type': 'hset',
    'key': 'label.set',
    'value': 'string',
    'set': true
});

Model('ap.state.connect.set', {
    'name': 'ap.state',
    'type': 'set',
    'key': 'connect.set',
    'value': 'string',
    'set': true
});

Model('ap.state.auth.set', {
    'name': 'ap.state',
    'type': 'set',
    'key': 'auth.set',
    'value': 'string',
    'set': true
});

Model('mall.goods', {
    'name': 'mall.goods',
    'type': 'simple',
    'attr': [{
        'key': 'owner',
        'default': -1,
        'type': 'int'
    }, {
        'key': 'name',
        'default': '',
        'type': 'string'
    }, {
        'key': 'describe',
        'default': '',
        'type': 'string'
    }, {
        'key': 'imageUrl',
        'default': '',
        'type': 'string'
    }, {
        'key': 'category',
        'default': -1,
        'type': 'int'
    }, {
        'key': 'price_origin',
        'default': '0',
        'type': 'string'
    }, {
        'key': 'price_true',
        'default': '0',
        'type': 'string'
    }, {
        'key': 'notice',
        'default': '',
        'type': 'string'
    }, {
        'key': 'buy_detail',
        'default': '',
        'type': 'string'
    }, {
        'key': 'isReturnAnytime',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'sales_number',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'available_number',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
});

Model('mall.coupon', {
    'name': 'mall.coupon',
    'type': 'simple',
    'attr': [{
        'key': 'title',
        'default': '',
        'type': 'string'
    }, {
        'key': 'describe',
        'default': '',
        'type': 'string'
    }, {
        'key': 'startTime',
        'default': '',
        'type': 'string'
    }, {
        'key': 'endTime',
        'default': '',
        'type': 'string'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }, {
        'key': 'isAllow',
        'default': 1,
        'type': 'int'
    }, {
        'key': 'isUsed',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'owner',
        'default': 1,
        'type': 'int'
    }, {
        'key': 'imageUrl',
        'default': '',
        'type': 'string'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
});

Model('mall.shop', {
    'name': 'mall.shop',
    'type': 'simple',
    'attr': [{
        'key': 'name',
        'default': '',
        'type': 'string'
    }, {
        'key': 'owner',
        'default': '',
        'type': 'int'
    }, {
        'key': 'code',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'mall_id',
        'default': 2,
        'type': 'int'
    }, {
        'key': 'introduction',
        'default': '',
        'type': 'string'
    }, {
        'key': 'address',
        'default': '',
        'type': 'string'
    }, {
        'key': 'sharp',
        'default': '',
        'type': 'string'
    }, {
        'key': 'level',
        'default': '',
        'type': 'string'
    }, {
        'key': 'imageUrl',
        'default': '',
        'type': 'string'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }, {
        'key': 'contact',
        'default': '',
        'type': 'string'
    }, {
        'key': 'phone',
        'default': '',
        'type': 'string'
    }, {
        'key': 'opening_hours',
        'default': '',
        'type': 'string'
    }, {
        'key': 'longitude',
        'default': '',
        'type': 'string'
    }, {
        'key': 'latitude',
        'default': '',
        'type': 'string'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
});

Model('mall.shop.coupon', {
    'name': 'mall.shop',
    'type': 'set',
    'key': 'coupon',
    'value': 'int',
    'set': true
});

Model('ap', {
    'name': 'ap',
    'type': 'simple',
    'attr': [{
        'key': 'shop_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'ip',
        'default': '',
        'type': 'string'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mac',
        'default': '',
        'type': 'string'
    }, {
        'key': 'authcode',
        'default': '',
        'type': 'string'
    }, {
        'key': 'openid',
        'default': 'yrnst97np1gv34mprbq757j0edig347e',
        'type': 'string'
    }],
    'set': false
});

Model('ap_v2', {
    'name': 'ap_v2',
    'type': 'simple',
    'attr': [{
        'key': 'shopId',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'ssid',
        'default': 'wushuu',
        'type': 'string'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mac',
        'default': '',
        'type': 'string'
    }, {
        'key': 'authcode',
        'default': '',
        'type': 'string'
    }, {
        'key': 'openid',
        'default': 'yrnst97np1gv34mprbq757j0edig347e',
        'type': 'string'
    }, {
        'key': 'owner',
        'default': 0,
        'type': 'int',
    }, {
        'key': 'alias',
        'default': '',
        'type': 'string'
    }, {
        'key': 'code',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
});

Model('ap.sync.info', {
    'name': 'ap.sync.info',
    'type': 'simple',
    'attr': [{
        'key': 'shopId',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'ssid',
        'default': 'wushuu',
        'type': 'string'
    }, {
        'key': 'portal_url',
        'default': '',
        'type': 'string'
    }, {
        'key': 'encrypt',
        'default': '',
        'type': 'int'
    }, {
        'key': 'encrypt_algorithm',
        'default': '',
        'type': 'int'
    }, {
        'key': 'encrypt_key',
        'default': '',
        'type': 'string'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})

Model('ap.portal.image', {
    'name': 'ap.portal.image',
    'type': 'simple',
    'attr': [{
        'key': 'shopId',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'url',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mall_id',
        'default': '',
        'type': 'int'
    }, {
        'key': 'space',
        'default': '',
        'type': 'int'
    }, {
        'key': 'status',
        'default': '-10001',
        'type': 'int'
    }, {
        'key': 'censor_id',
        'default': '-10001',
        'type': 'int'
    }, {
        'key': 'valid',
        'default': '1',
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
});


Model('ap.ssid', {
    'name': 'ap.ssid',
    'type': 'simple',
    'attr': [{
        'key': 'ssid',
        'default': 'wushuu',
        'type': 'string'
    }],
    'set': false
})

Model('ap.client', {
    'name': 'ap.client',
    'type': 'set',
    'key': 'mac',
    'value': 'string',
    'set': true
});
/*
 * ap.wlist & ap.blist is depressed
 */
Model('ap.wlist', {
    'name': 'ap.wlist',
    'type': 'set',
    'key': 'mac.set',
    'value': 'string',
    'set': true
});

Model('ap.blist', {
    'name': 'ap.blist',
    'type': 'set',
    'key': 'mac.set',
    'value': 'string',
    'set': true
});

/*
 *  persist the ap.wblist
 */
Model('ap.wblist', {
    'name': 'ap.wblist',
    'type': 'simple',
    'attr': [{
        'key': 'shopId',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'type',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'mac',
        'default': '',
        'type': 'string'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'PG': true,
    'set': false
})

Model('account', {
    'name': 'acount',
    'type': 'simple',
    'attr': [{
        'key': 'name',
        'default': 0,
        'type': 'string'
    }, {
        'key': 'registTime',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'phone',
        'default': '',
        'type': 'string'
    }, {
        'key': 'account',
        'default': '',
        'type': 'string'
    }, {
        'key': 'password',
        'default': '',
        'type': 'string'
    }, {
        'key': 'gender',
        'default': 0,
        'type': 'int'
    }],
    'set': false
});

Model('ad.owner', {
    'name': 'ad.owner',
    'type': 'simple',
    'attr': [{
        'key': 'name',
        'default': '',
        'type': 'string'
    }, {
        'key': 'user_name',
        'default': '',
        'type': 'string'
    }, {
        'key': 'password',
        'default': '',
        'type': 'string'
    }, {
        'key': 'balance',
        'default': 0,
        'type': 'double'
    }, {
        'key': 'regist_date',
        'default': '',
        'type': 'string'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }, {
        'key': 'last_login_time',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
});

Model('mall', {
    'name': 'mall',
    'type': 'simple',
    'attr': [{
        'key': 'name',
        'default': '',
        'type': 'string'
    }, {
        'key': 'describe',
        'default': '',
        'type': 'string'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})

Model('ad.owner.special', {
    'name': 'ad.owner.special',
    'type': 'simple',
    'attr': [{
        'key': 'name',
        'default': 0,
        'type': 'string'
    }, {
        'key': 'password',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mall_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'priority',
        'type': 'string',
        'default': 'knight'
    }, {
        'key': 'last_login_time',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
});

Model('ad.owner.priority', {
    'name': 'ad.owner.priority',
    'type': 'simple',
    'attr': [{
        'key': 'title',
        'default': '',
        'type': 'string'
    }, {
        'key': 'describe',
        'type': 'string',
        'default': ''
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }]
});


Model('ad.owner.shop.set', {
    'name': 'ad.owner',
    'type': 'set',
    'key': 'shop.set',
    'value': 'int',
    'set': true
});

Model('ad.owner.ap.set', {
    'name': 'ad.owner',
    'type': 'set',
    'key': 'ap.set',
    'value': 'int',
    'set': true
});

Model('ad.owner.adGroup.set', {
    'name': 'ad.owner',
    'type': 'set',
    'key': 'adGroup.set',
    'value': 'int',
    'set': true
});

Model('user_flow', {
    'name': 'user_flow',
    'type': 'simple',
    'attr': [{
        'key': 'time',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'num',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'mall_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'shop_id',
        'default': -1,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
});

Model('shop_member', {
    'name': 'shop_member',
    'type': 'simple',
    'attr': [{
        'key': 'shopId',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'type',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'mac',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mall_id',
        'default': 0,
        'type': 'string'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true,
});

Model('tags_define', {
    'name': 'tags_define',
    'type': 'simple',
    'attr': [{
        'key': 'tag_name',
        'default': '',
        'type': 'text'
    }, {
        'key': 'tag_group',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true,
})

Model('acl_roles', {
    'name': 'acl_roles',
    'type': 'simple',
    'attr': [{
        'key': 'owner',
        'default': '',
        'type': 'int'
    }, {
        'key': 'type',
        'default': '',
        'type': 'text'
    }, {
        'key': 'level',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})

Model('acl_permission', {
    'name': 'acl_permission',
    'type': 'simple',
    'attr': [{
        'key': 'type',
        'default': '',
        'type': 'text'
    }, {
        'key': 'level',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'action',
        'default': '',
        'type': 'text'
    }, {
        'key': 'param',
        'default': '',
        'type': 'text'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})


Model('Cache.group.set', {
    'name': 'Cache',
    'type': 'set',
    'key': 'group.set',
    'value': 'string',
    'set': true

})
Model('Cache.group.param.set', {
    'name': 'Cache.group',
    'type': 'set',
    'key': 'param.set',
    'value': 'string',
    'set': true
});

Model('user_arrive', {
    'name': 'user_arrive',
    'type': 'simple',
    'attr': [{
        'key': 'mall_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'shopId',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'user_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'arrive_time',
        'type': 'date'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})

Model('transaction_record', {
    'name': 'transaction_record',
    'type': 'simple',
    'attr': [{
        'key': 'owner',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }, {
        'key': 'change',
        'default': 0,
        'type': 'double'
    }, {
        'key': 'remark',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mall_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'check_str',
        'default': '',
        'type': 'string'
    }, {
        'key': 'transaction_time',
        'type': 'date'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})

Model('owner_change', {
    'name': 'owner_change',
    'type': 'simple',
    'attr': [{
        'key': 'owner',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'tr_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }, {
        'key': 'pre',
        'default': 0,
        'type': 'double'
    }, {
        'key': 'change',
        'default': 0,
        'type': 'double'
    }, {
        'key': 'after',
        'default': 0,
        'type': 'double'
    }, {
        'key': 'remark',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mall_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'check_str',
        'default': '',
        'type': 'string'
    }, {
        'key': 'transaction_time',
        'type': 'date'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})

Model('fund_queue', {
    'name': 'fund_queue',
    'type': 'simple',
    'attr': [{
        'key': 'owner',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }, {
        'key': 'change',
        'default': 0,
        'type': 'double'
    }, {
        'key': 'remark',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mall_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'transaction_time',
        'type': 'date'
    }, {
        'key': 'checked',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'code',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})

Model('mall_income_record', {
    'name': 'mall_income_record',
    'type': 'simple',
    'attr': [{
        'key': 'owner',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'type',
        'default': '',
        'type': 'string'
    }, {
        'key': 'income',
        'default': 0,
        'type': 'double'
    }, {
        'key': 'remark',
        'default': '',
        'type': 'string'
    }, {
        'key': 'mall_id',
        'default': 0,
        'type': 'int'
    }, {
        'key': 'check_str',
        'default': '',
        'type': 'string'
    }, {
        'key': 'transaction_time',
        'type': 'date'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})

Model('ads_engine', {
    'name': 'ads_engine',
    'type': 'simple',
    'attr': [{
        'key': 'name',
        'default': '',
        'type': 'string'
    }, {
        'key': 'weight',
        'default': 1,
        'type': 'int'
    }, {
        'key': 'desc',
        'default': '',
        'type': 'string'
    }, {
        'key': 'valid',
        'default': 1,
        'type': 'int'
    }, {
        'key': 'create_time',
        'type': 'date'
    }, {
        'key': 'update_time',
        'type': 'date'
    }],
    'set': false,
    'PG': true
})


function Model(modelName, conf) {
    MODEL_OBJECTS[modelName] = conf;
}

function Model_setDB(_db) {
    db = _db;
}

function Model_getDB() {
    return db;
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
        var dao = $this.createDao();
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
        var dao = new DAO(conf, db);
        return dao;
    } else {
        var where = {};
        if (typeof $this.where_str == 'object')
            where = $this.where_str;
        var dao = new DAO_OF_PG({
            'table': $this.model.name,
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

    var dao = new DAO_OF_SET(conf, db);
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


exports.Model_regist = Model;
exports.Model_setDB = Model_setDB;
exports.Model_getDB = Model_getDB;
exports.Model_factory = Model_factory;