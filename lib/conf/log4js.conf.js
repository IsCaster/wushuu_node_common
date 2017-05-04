function getLogConf(file_path, file_name, depth) {

    if (typeof depth != "number") {
        depth = 11
    }

    var log_config = {
        "appenders": [{
            type: "file",
            layout: {
                type: "pattern",
                pattern: "%[[%r] %5.5p {%x{ln}} -%] %m",
                tokens: {
                    ln: function() {
                        // The caller:
                        //console.log((new Error).stack)
                        return (new Error).stack.split("\n")[depth]
                            // Just the namespace, filename, line:
                            .replace(/^\s+at\s+(\S+)\s\((.+?)([^\/]+):(\d+):\d+\)$/, function() {
                                return arguments[1] + '() ' + arguments[3] + ':' + arguments[4];
                                // return arguments[0] +' '+ arguments[2] +' line '+arguments[3]
                            });
                    }
                },
            },
            filename: file_path + '/' + file_name + '.log',
            maxLogSize: 204800,
            backups: 10,
            category: file_name
        }]
    }
    return log_config
}

module.exports = {
    "getLogConf": getLogConf
}