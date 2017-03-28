var $depth = 11;

function get_conf_file(file_path, category) {
	var conf_file = {
		"appenders": [{
			type: "file",
			layout: {
				type: "pattern",
				pattern: "%[[%r] %5.5p {%x{ln}} -%] %m",
				tokens: {
					ln: function() {
						// The caller:
						//console.log((new Error).stack)
						return (new Error).stack.split("\n")[$depth]
							// Just the namespace, filename, line:
							.replace(/^\s+at\s+(\S+)\s\((.+?)([^\/]+):(\d+):\d+\)$/, function() {
								return arguments[1] + '() ' + arguments[3] + ':' + arguments[4];
								// return arguments[0] +' '+ arguments[2] +' line '+arguments[3]
							});
					}
				},
			},
			filename: file_path,
			maxLogSize: 204800,
			backups: 10,
			category: category
		}]
	}
	return conf_file
}

module.exports = {
	"get_conf_file": get_conf_file
}