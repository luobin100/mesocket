const { crc16modbus } = require('crc');
const util = require("luoutil");

/**
 * 获取crc校验码
 * @param strData
 * @returns {string}
 */
function getCRC (strData) {

    const buf = Buffer.from(strData, "hex");
    const resultCrc = ("0000" + crc16modbus(buf).toString(16)).slice(-4);
    const resultCrcBigEndian = util.strChunk(resultCrc, 2).reverse().join("");

    return resultCrcBigEndian;
}

/**
 * 校验crc校验是否通过
 * @param bufData
 * @returns {boolean}
 */
function isCrcPass (bufData) {

    // 因为 Buffer 的slice 和 String 的slice 不一样，
    // Buffer slice 到的是原有Buffer 的引用，改变 slice 后的值会影响原有值。
    // 用 Buffer的 from 或者 copy 可以规避这个问题。
    bufData = Buffer.from(bufData);
    const strData = bufData.toString("hex");
    const retDataWithoutCRC = strData.slice(0, strData.length -4); // 截取前面的数据（除去crc校验码部分）
    const crcValue = strData.slice(-4).toLowerCase();
    const calcCRC = getCRC(retDataWithoutCRC);
    if (crcValue && crcValue !== "" && crcValue === calcCRC) {
        return true;
    }
    return false;
}

function bufAppendCRC(bufData) {
    // 克隆buffer
    bufData = Buffer.from(bufData);
    const strData = bufData.toString("hex");
    const calcCRC = getCRC(strData);
    const retBuf = Buffer.from(strData + calcCRC, "hex");
    return retBuf;
}

module.exports = {
    getCRC: getCRC,
    isCrcPass: isCrcPass,
    bufAppendCRC: bufAppendCRC,
}



