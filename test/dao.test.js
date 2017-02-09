var should = require('should');
var DAO = require('../lib/DAO.js').DAO
var pg_conf = {
	'host': 'pg',
	'port': 5432,
	'user': 'wushuu',
	'pass': 'woyoadmin',
	'db': 'adsweb'
}
var pg_conn_str = "postgres://" + pg_conf.user + ":" + pg_conf.pass + "@" + pg_conf.host + "/" + pg_conf.db;



var DAOTest = mdb => {
	describe('[ DAO/DAO.js (' + mdb + ') ]', function() {
		var conf = {
			'name': 'test_user_dao',
			'type': 'simple',
			'attr': [{
				'key': 'name',
				'default': "null",
				'valueType': 'string'
			}, {
				'key': 'age',
				'default': 0,
				'valueType': 'int'
			}, {
				'key': 'gender',
				'default': "",
				'valueType': 'string'
			}, {
				'key': 'phone',
				'default': '',
				'valueType': 'string'
			}]
		}
		var db
		var new_user_id = 0
		var userDao
		var new_user
		var new_user2

		before(function(done) {
			var DB = require('../lib/' + mdb + '_db').DB
			db = new DB();
			db.q_connect().then(function() {
				console.log('memory db connected')
				return require('../lib/DAO.js').init(pg_conn_str)
			}).then(() => {
				console.log('dao module inited')
				done()
			}).catch(err => done(err))
		})

		it('DAO.prototype.save()', function(done) {
			userDao = new DAO(conf, db)
			new_user = {
				'name': 'koolee',
				'age': 30,
				'gender': 'male',
				'phone': '13888888888'
			}
			userDao.save(new_user, ret => {
				if (ret.code) {
					console.log("new user id = " + ret.index)
					new_user_id = ret.index
					done()
				} else {
					done(new Error("unable to save new user"))
				}
			})
		})

		it('DAO.prototype.findOne()', function(done) {
			userDao.findOne(new_user_id, ret => {
				console.log("DAO.prototype.findOne() ret=" + JSON.stringify(ret))
				if (ret.code) {
					ret.value.name.should.equal(new_user.name)
					ret.value.age.should.equal(new_user.age)
					ret.value.gender.should.equal(new_user.gender)
					ret.value.phone.should.equal(new_user.phone)
					done()
				} else {
					done(new Error("DAO.prototype.findOne() failed"))
				}
			})
		})

		it('DAO.prototype.update()', function(done) {
			userDao.update(new_user_id, {
				'name': 'koolee2',
				"age": 31
			}, ret => {
				if (ret.code) {
					console.log("DAO.prototype.update() returned, check result now")
					userDao.findOne(new_user_id, ret => {
						if (ret.code) {
							ret.value.name.should.equal("koolee2")
							ret.value.age.should.equal(31)
							ret.value.gender.should.equal(new_user.gender)
							ret.value.phone.should.equal(new_user.phone)
							done()
						} else {
							done(new Error("DAO.prototype.update() findOne failed"))
						}
					})
				} else {
					done(new Error("DAO.prototype.update() update failed!"))
				}
			})
		})

		it('DAO.prototype.save() with index', function(done) {
			new_user2 = {
				'name': 'alice',
				'age': 18,
				'gender': 'female',
				'phone': '13999999999',
				'id': new_user_id + 1
			}
			userDao.save(new_user2, ret => {
				if (ret.code) {
					console.log("new user2 id = " + ret.index)
					userDao.findOne(ret.index, ret => {
						if (ret.code) {
							ret.value.name.should.equal(new_user2.name)
							ret.value.age.should.equal(new_user2.age)
							ret.value.gender.should.equal(new_user2.gender)
							ret.value.phone.should.equal(new_user2.phone)
							done()
						} else {
							done(new Error("DAO.prototype.save() findOne failed"))
						}
					})
				} else {
					done(new Error("unable to save new user"))
				}
			})
		})

		it('DAO.prototype.save() with old index', function(done) {
			new_user = {
				'name': 'koolee',
				'age': 32,
				'gender': 'male',
				'phone': '13888888888',
				'id': new_user_id
			}
			userDao.save(new_user, ret => {
				if (ret.code) {
					console.log("user id = " + ret.index)
					userDao.findOne(ret.index, ret => {
						if (ret.code) {
							ret.value.name.should.equal(new_user.name)
							ret.value.age.should.equal(new_user.age)
							ret.value.gender.should.equal(new_user.gender)
							ret.value.phone.should.equal(new_user.phone)
							done()
						} else {
							done(new Error("DAO.prototype.save() findOne failed"))
						}
					})
				} else {
					done(new Error("unable to save new user"))
				}
			})
		})

		it('DAO.prototype.save() when auto generated index is used', function(done) {
			new_user2 = {
				'name': 'alice',
				'age': 19,
				'gender': 'female',
				'phone': '13999999900'
			}
			userDao.save(new_user2, ret => {
				if (ret.code) {
					console.log("new user id = " + ret.index)
					ret.index.should.equal(new_user_id + 2)
					userDao.findOne(ret.index, ret => {
						console.log("DAO.prototype.findOne() ret=" + JSON.stringify(ret))
						if (ret.code) {
							ret.value.name.should.equal(new_user2.name)
							ret.value.age.should.equal(new_user2.age)
							ret.value.gender.should.equal(new_user2.gender)
							ret.value.phone.should.equal(new_user2.phone)
							done()
						} else {
							done(new Error("DAO.prototype.save() findOne failed"))
						}
					})
				} else {
					done(new Error("unable to save new user"))
				}
			})
		})

		it('DAO.prototype.list() ', function(done) {
			var expectList = [{
				"code": true,
				"index": new_user_id,
				"value": {
					"name": "koolee",
					"age": 32,
					"gender": "male",
					"phone": "13888888888"
				}
			}, {
				"code": true,
				"index": new_user_id + 1,
				"value": {
					"name": "alice",
					"age": 18,
					"gender": "female",
					"phone": "13999999999"
				}
			}, {
				"code": true,
				"index": new_user_id + 2,
				"value": {
					"name": "alice",
					"age": 19,
					"gender": "female",
					"phone": "13999999900"
				}
			}]
			userDao.list().then(ret => {
				var List = ret.value
				expectList.forEach(expectUser => {
					var bExistUser = List.some(user => {
						if (expectUser.index === user.index) {
							expectUser.value.name.should.equal(user.value.name)
							expectUser.value.age.should.equal(user.value.age)
							expectUser.value.gender.should.equal(user.value.gender)
							expectUser.value.phone.should.equal(user.value.phone)
						}
						return expectUser.index === user.index
					})
					bExistUser.should.equal(true)
				})
				done()
			}).catch(done)
		})

		it('DAO.prototype.del() ', function(done) {
			Promise.all([new_user_id, new_user_id + 1, new_user_id + 2].map(user_id => new Promise((resolve, reject) =>
					userDao.del(user_id, ret => {
						if (ret.code) {
							userDao.findOne(user_id, ret => {
								console.log("DAO.prototype.findOne() ret=" + JSON.stringify(ret))
								if (ret.code) {
									reject(new Error("DAO.prototype.del() failed"))
								} else {
									resolve()
								}
							})
						} else {
							reject(new Error("unable to delete user"))
						}
					}))))
				.then(() => done())
				.catch(done)
		})

	})
}

["tair", "redis"].forEach(DAOTest)