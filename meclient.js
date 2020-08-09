/***
 * tcp socket 测试工具 客户端
 * 分为两种模式 hex 和 utf8
 * 使用 set hex 或 set utf8 进行模式切换。
 * 如果不是 set + 空格 开头则说明当前操作为发送，不是设置操作。
 * 发送操作 也分两种： 直接发送 及 附上crc校验码后发送。
 * 附上crc发送示例：F60300000001 autocrc
 */
var net = require('net');
var readline = require('readline');
const SocketDealer = require("./SocketDealer");
const {NO_FILTER} = require("./Const")

/*---- arguments check ----*/
if (process.argv.length < 4) {
    console.log(`\r\n Usage: ${process.argv[0].split("/").slice(-1)} ${process.argv[1].split("/").slice(-1)} <server> <port> <mode>(option) <filter>(option) <timestamp>(option) \r\n`);
    return 1;
}

const SERVER_ADDR = process.argv[2];
let PORT_NUMBER = process.argv[3];
let INIT_MODE = process.argv[4];
let INIT_FILTER = process.argv[5];
let INIT_TIMESTAMP = process.argv[6];

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
if (INIT_MODE !== "hex" && INIT_MODE !== "utf8") {
    console.log("第三参数模式 必须为 hex 或 utf8")
    return 1;
}

// filter 默认设置为 No_Filter
if (!INIT_FILTER) {
    INIT_FILTER = NO_FILTER
}

// 添加转义字符的功能，让输入参数可支持回车换行 \r\n
// 因为bash 默认的IFS (Internal Field Separator) 是 space、 tab、 和 换行，这样就没法输入回车为参数了
// 也可以使用 ANSI C Like String: $'\r\n'
// References: https://stackoverflow.com/questions/4351521/how-do-i-pass-command-line-arguments-to-a-node-js-program
INIT_FILTER = INIT_FILTER.replace(/\\r/g, "\r").replace(/\\n/g, "\n");


// 显示时间 默认设置为 不显示 off
if (!INIT_TIMESTAMP) {
    INIT_TIMESTAMP = "off"
}
if (INIT_TIMESTAMP  !== "on" && INIT_TIMESTAMP !== "off") {
    console.log("第五参数显示时间 必须为 on 或 off")
    return 1;
}

/*---- main ----*/
var socket = new net.Socket();
const socketDealer = new SocketDealer(socket, INIT_MODE, undefined, undefined, INIT_FILTER, INIT_TIMESTAMP);

socket.connect(PORT_NUMBER, SERVER_ADDR, function() {
    console.log('Connected');

    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('line', function (line) {
        socketDealer.handleClientLine(line);
    });

});
socket.setKeepAlive(true, 10000) // 设置 tcp keepalive，防止客户端意外断开连接。
socket.setTimeout(10000); // 设置的 read timeout 时间 毫秒

socket.on('data', function(data) {
    socketDealer.handleClientData(undefined, data);
});

socket.on('close', function() {
    console.log('Connection closed');
});
