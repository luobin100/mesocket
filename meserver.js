/***
 * tcp socket 测试工具 服务端
 * 分为两种模式 hex 和 ascii，
 * 使用 set hex 或 set ascii 进行模式切换。
 * 如果不是 set + 空格 开头则说明当前操作为发送，不是设置操作。
 * 发送操作 也分两种： 直接发送 及 附上crc校验码后发送。
 * 附上crc发送示例：F60300000001 autocrc
 */
var net = require('net');
var readline = require('readline');
const SocketDealer = require("./SocketDealer");

/*---- parameters check ----*/
if (process.argv.length < 3) {
    console.log(`\r\n Usage: ${process.argv[0].split("/").slice(-1)} ${process.argv[1].split("/").slice(-1)} <port> <mode>(mode is optional) \r\n`);
    return 1;
}

let PORT_NUMBER = process.argv[2];
let INIT_MODE = process.argv[3];

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
const socketPool = [];
const socketDealer = new SocketDealer(undefined, INIT_MODE, socketPool);

var server = net.createServer(function(socket) {

    console.log('Client in! ip:' + socket.remoteAddress);
    socket.write('Echo server\r\n');
    socketPool.push(socket); // 加入socket连接池，以方便外面的代码使用

    // 断开连接时，从socket连接池中删除
    socket.on('close', function() {
        console.log('Client closed! ip:' + socket.remoteAddress);
        const idx = socketPool.indexOf(socket);
        socketPool.splice(idx, 1);
    });

    socket.on("data", data => {
        socketDealer.handleData(data)
    })
});

server.listen(PORT_NUMBER, '0.0.0.0');
console.log("server listening on 0.0.0.0:" + PORT_NUMBER.toString());

readline.createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', function (line) {
    socketDealer.handleServerLine(line);
});
