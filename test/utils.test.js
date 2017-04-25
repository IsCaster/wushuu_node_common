var utils = require('../lib/utils')
var express = require('express')
var should = require('should')
var request = require('supertest')
var app
describe('[utils test]', function() {

	it('get_err_msg_true.test', function(done) {
		//"-20004": "[tair-rdb] data already exists",
		//"-20005": "[tair-rdb] data not exists in selected range",
		//"-3998": "[tair-rdb] data not exists",
		var code_err = '-3998'
		var code_exist = '-20004'
		msg_exist = utils.get_err_msg(code_exist)
		msg_err = utils.get_err_msg(code_err)
		msg_exist.should.equal('[tair-rdb] data already exists')
		msg_err.should.equal('[tair-rdb] data not exists')
		done();
	})

	/*	it('get_tags_from_pg.test', function(done) {
			utils.get_tags_from_pg().then(function(msg) {
				console.log(msg)
				done()
			}).catch(function(err) {
				console.err(err)
				done(err)
			})
		})
	*/
	/*it('get_request.test', function(done) {
		var param = '';
		var connection = {
			'host': '219.153.20.141',
			'port': '1080',
			'url': '/user_op.cgi',
			'path': true
		}
		var isEnd = function(resp) {
			res.send({
				'code': 1
			})
		}
		msg = utils.http_get(param, connection, isEnd);
		console.log('msg=' + msg)
		if (msg.code === 1) {
			console.log('get_request success')
		}
		done()
	})*/

	it('mac_format.test', function(done) {
		var mac = '18764998447377'
		var msg = utils.int2mac(mac);
		msg.should.equal('11:11:11:11:11:11');
		done();
	})

	it('checkNecessary_success.test', function(done) {
		app = express()

		app.get('/utils/checkNecessary', function(req, res) {
			var necessary = ['shopId', 'name'];
			if (utils.checkNecessary(necessary, req, res, 'GET')) {
				res.send({
					'code': 1,
					'msg': 'check success!'
				})
			}
			return
		});
		request(app)
			.get('/utils/checkNecessary')
			.query({
				'shopId': 1,
				'name': 'shop'
			})
			.expect(200)
			.end(function(err, res) {
				should.not.exist(err);
				var ret = JSON.parse(res.text)
				ret.code.should.equal(1)
				ret.msg.should.equal('check success!')
				done()
			})
	})

	it('checkNecessary_fail.test', function(done) {
		app = express()

		app.get('/utils/checkNecessary', function(req, res) {
			var necessary = ['shopId', 'name'];
			if (utils.checkNecessary(necessary, req, res, 'GET')) {
				res.send({
					'code': 1,
					'msg': 'check success!'
				})
			}
			return
		});
		request(app)
			.get('/utils/checkNecessary')
			.query({
				'shopId': 1,
			})
			.expect(200)
			.end(function(err, res) {
				should.not.exist(err);
				var ret = JSON.parse(res.text)
				ret.code.should.equal(0)
				ret.msg.should.equal('[name] required')
				done()
			})
	})

	it('checkAllkeys_success.test', function(done) {
		app = express()

		app.get('/utils/checkAllKeys', function(req, res) {
			var all_keys = {
				'shopId': true,
				'name': true
			}
			if (utils.checkAllKeys(all_keys, req, 'GET')) {
				res.send({
					'code': 1,
					'msg': 'check success!'
				})
			}
			return
		});
		request(app)
			.get('/utils/checkAllKeys')
			.query({
				'shopId': 1,
				'name': 'shop demo'
			})
			.expect(200)
			.end(function(err, res) {
				should.not.exist(err);
				var ret = JSON.parse(res.text)
				ret.code.should.equal(1)
				ret.msg.should.equal('check success!')
				done()
			})
	})

	it('checkAllkeys_success.test', function(done) {
		app = express()

		app.get('/utils/checkAllKeys', function(req, res) {
			var all_keys = {
				'shopId': true,
				'name': true
			}
			if (utils.checkAllKeys(all_keys, req, 'GET')) {
				res.send({
					'code': 1,
					'msg': 'check success!'
				})
			}
			return
		});
		request(app)
			.get('/utils/checkAllKeys')
			.query({
				'shopId': 1,
				'name': 'shop'
			})
			.expect(200)
			.end(function(err, res) {
				should.not.exist(err);
				var ret = JSON.parse(res.text)
				ret.code.should.equal(1)
				ret.msg.should.equal('check success!')
				done()
			})
	})

	it('checkAllkeys_fail.test', function(done) {
		app = express()

		app.get('/utils/checkAllKeys', function(req, res) {
			var all_keys = {
				'shopId': true,
				'name': true
			}
			if (utils.checkAllKeys(all_keys, req, 'GET') == false) {
				utils.failHandler(res, 'check success!')
			}
			return
		});
		request(app)
			.get('/utils/checkAllKeys')
			.query({
				'shopId': 1,
			})
			.expect(200)
			.end(function(err, res) {
				should.not.exist(err);
				var ret = JSON.parse(res.text)
				ret.code.should.equal(0)
				ret.msg.should.equal('check success!')
				done()
			})
	})

	it('getUsefulKeys.test', function(done) {
		app = express()
		var keys = {
			'shopId': true,
		}
		app.get('/utils/getUsefulKeys', function(req, res) {
			var list = utils.getUsefulKeys(keys, req, 'GET')
			res.send({
				'list': list,
			})
			return
		});
		request(app)
			.get('/utils/getUsefulKeys')
			.query({
				'shopId': 1,
			})
			.expect(200)
			.end(function(err, res) {
				should.not.exist(err);
				// console.log(res)
				res.text.should.equal('{"list":{"shopId":"1"}}')
				done()
			})
	})
})