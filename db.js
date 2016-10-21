function ansyMap(array) {
    this.array = array;
    this.count = 0;
    this.results = [];
}

ansyMap.prototype.done = function(result) {
    this.count++;
    this.results.push(result);
    if (this.array.length == this.count) {
        this.onDone.apply(this);
    }
}

ansyMap.prototype.map = function(fn) {
    if (this.array.length == 0) {
        this.onDone.apply(this);
    } else {
        for (var i = 0; i < this.array.length; i++) {
            fn.apply(this, [this.array[i]]);
        }
    }

    return this;
}
ansyMap.prototype.onDone = function() {

}

exports.ansyMap = ansyMap;
exports.DB = require("./tair_db").DB;