exports.convertCommand = convertCommand;

function convertCommand(command) {
    var minOfHour = allocateArray(lengthInByte(60), 0); //length 60
    var hourOfDay = allocateArray(lengthInByte(24), 0);
    var dayOfMonth = allocateArray(lengthInByte(31), 0) //length 31
    var monthOfYear = allocateArray(lengthInByte(12), 0) //length:12
    var dayOfWeak = allocateArray(lengthInByte(7), 0) //length 7

    var total = [minOfHour, hourOfDay, dayOfMonth, monthOfYear, dayOfWeak]
        //check format
        //min-hour-pair
    if (command[0].length != command[1].length) {
        if ((command[0] == '*' || command[1] == '*') == false) {
            return false;
        }
    }

    //set Minute
    if (command[0] == '*') {
        minOfHour = minOfHour.map(function(obj) {
            return 1;
        });
    } else {
        selectBitPos(command[0], minOfHour);
    }
    //set Hour
    if (command[1] == '*') {
        hourOfDay = hourOfDay.map(function(obj) {
            return 1;
        });
    } else {
        selectBitPos(command[1], hourOfDay)
    }
    //set day of Month
    if (command[2] == '*') {
        dayOfMonth = dayOfMonth.map(function(obj) {
            return 1;
        })
    } else {
        selectBitPos(command[2], dayOfMonth, true);
    }
    //set month of year
    if (command[3] == '*') {
        monthOfYear = monthOfYear.map(function(obj) {
            return 1;
        })
    } else {
        selectBitPos(command[3], monthOfYear, true);
    }
    //set year
    if (command[4] == '*') {

    }

    var result = joinMultiArray(total);
    return normalToBuffer(result);
}

function joinMultiArray(multiArray) {
    var result = []
    for (var i = 0; i < multiArray.length; i++) {
        result = result.concat(multiArray[i])
    }
    return result;
}

function selectBitPos(select_str, contain, moving) {
    var selected = select_str.split(',');
    for (var i = 0; i < selected.length; i++) {
        var item = parseInt(selected[i]);
        if (moving)
            item--;
        contain[item] = 1;
    }
}

function lengthInByte(length) {
    length--;
    return (Math.floor(length / 8) + 1) * 8;
}

function allocateArray(length, initValue) {
    var arr = [];
    for (var i = 0; i < length; i++)
        arr.push(initValue);
    return arr;
}

function toBytesInt32(num) {
    arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    view = new DataView(arr);
    view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
    return [arr['0'], arr['1'], arr['2'], arr['3']]
}

function createBinaryString(nMask) {
    // nMask must be between -2147483648 and 2147483647
    for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
    return sMask;
}

function byteToBits(octet) {
    var bits = [];
    for (var i = 7; i >= 0; i--) {
        var bit = octet & (1 << i) ? 1 : 0;
        bits.push(bit);
    }
    return bits;
}

function toBitsInt32(num) {
    var byteArr = toBytesInt32(num);
    console.log(byteArr)
    var bits = [];
    for (var i = 0; i < byteArr.length; i++) {
        bits = bits.concat(byteToBits(byteArr[i]));
    }
    return bits;
}

function abToBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}

function normalToBuffer(nb) {
    var buffer = new Buffer(nb.length);
    for (var i = 0; i < nb.length; i++) {
        buffer[i] = nb[i];
    }
    return buffer;
}

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
