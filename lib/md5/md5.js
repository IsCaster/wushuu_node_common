var md5 = require('md5');
var Promise = require('promise');

var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd',
	'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
	's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
	'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
	'U', 'V', 'W', 'X', 'Y', 'Z'
];

var getsalt = function(callback) {
	var str = '';
	for (var i = 0; i < 95; i++) {
		str += chars[Math.floor(Math.random() * chars.length)];
	}
	callback(str);
}

exports.encrypt = function(password, callback) {
	var salt = '';
	getsalt(function(result) {
		salt = result;
		new Promise(function(resolve, reject) {
			var encrypted = md5(password + salt) + ' ' + salt;
			console.log('./web/md5.js-encrypt():encrypted=' + encrypted);
			resolve(encrypted);
		}).then(function(encrypted) {
			return new Promise(function(resolve, reject) {
				callback(encrypted);
				resolve();
			})
		})
	})
}

exports.compare = function(password, encrypted, callback) {
	var salt = encrypted.substring(encrypted.indexOf(' ') + 1);
	new Promise(function(resolve, reject) {
		var compare = md5(password + salt) + ' ' + salt;
		resolve(compare);
	}).then(function(compare) {
		return new Promise(function(resolve, reject) {
			if (encrypted == compare) {
				callback(true);
			} else {
				callback(false);
			}
			resolve();
		})
	})
}