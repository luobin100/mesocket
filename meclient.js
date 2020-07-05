/***
 * tcp socket 测试工具 客户端
 * 分为两种模式 hex 和 ascii，
 * 使用 set hex 或 set ascii 进行模式切换。
 * 如果不是 set + 空格 开头则说明当前操作为发送，不是设置操作。
 * 发送操作 也分两种： 直接发送 及 附上crc校验码后发送。
 * 附上crc发送示例：F60300000001 autocrc
 */
var net = require('net');
var readline = require('readline');
const SocketDealer = require("./SocketDealer");

/*---- arguments check ----*/
if (process.argv.length < 4) {
    console.log(`\r\n Usage: ${process.argv[0].split("/").slice(-1)} ${process.argv[1].split("/").slice(-1)} <server> <port> <mode>(mode is optional) \r\n`);
    return 1;
}

const SERVER_ADDR = process.argv[2];
let PORT_NUMBER = process.argv[3];
let INIT_MODE = process.argv[4];

if (!SERVER_ADDR) {
    console.log("第一参数服务器地址未填写！")
    return 1;
}
if (!PORT_NUMBER) {
    console.log("第二参数端口地址未填写！")
    return 1;
}
if (isNaN(PORT_NUMBER)) {
    console.log("第二参数端口地址必须为数字！")
    return 1;
}
PORT_NUMBER = parseInt(PORT_NUMBER);
// 模式默认设置为 hex
if (!INIT_MODE) {
    INIT_MODE = "hex"
}
if (INIT_MODE !== "hex" && INIT_MODE !== "ascii") {
    console.log("第三参数模式 必须为 hex 或 ascii！")
    return 1;
}

/*---- main ----*/
var socket = new net.Socket();
const socketDealer = new SocketDealer(socket, INIT_MODE);

socket.connect(PORT_NUMBER, SERVER_ADDR, function() {
    console.log('Connected');

    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('line', function (line) {
        socketDealer.handleClientLine(line);
    });

});

socket.on('data', function(data) {
    socketDealer.handleData(undefined, data);
});

socket.on('close', function() {
    console.log('Connection closed');
});
