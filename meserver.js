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
const {NO_FILTER} = require("./Const")

/*---- arguments check ----*/
if (process.argv.length < 3) {
    console.log(`\r\n Usage: ${process.argv[0].split("/").slice(-1)} ${process.argv[1].split("/").slice(-1)} <port> <mode>(option) <filter>(option) \r\n`);
    return 1;
}

let PORT_NUMBER = process.argv[2];
let INIT_MODE = process.argv[3];
let INIT_FILTER = process.argv[4];

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

// filter 默认设置为 No_Filter
if (!INIT_FILTER) {
    INIT_FILTER = NO_FILTER
}

/*---- main ----*/
const socketPool = [];
const socketDealer = new SocketDealer(undefined, INIT_MODE, socketPool, undefined, INIT_FILTER);

var server = net.createServer(function(socket) {
    socket.setKeepAlive(true, 10000) // 设置 tcp keepalive，防止客户端意外断开连接。
    console.log('Client in! ' + socket.remoteAddress + ':' + socket.remotePort);
    socket.write('Echo server\r\n');
    socketPool.push(socket); // 加入socket连接池，以方便外面的代码使用

    // 断开连接时，从socket连接池中删除
    socket.on('close', function(hadError) {
        console.log(`Client closed${hadError ? ' with error' : ''}! ` + socket.remoteAddress + ':' + socket.remotePort);
        removeSocket();
    });

    function removeSocket() {
        const idx = socketPool.indexOf(socket);
        socketPool.splice(idx, 1);
    }

    socket.on("data", data => {
        socketDealer.handleServerData(socket, data)
    })

    // handle keepalive error 客户端意外断开
    socket.on("error", function(err) {
        console.log('socket err! ' + err);
        removeSocket();
    })

    // 是否启用心跳包
    // socket.setTimeout(10000);
    // socket.on("timeout", function() {
    //     console.log('socket timeout!')
    //     socket.end();
    //     removeSocket();
    // })
});

server.listen(PORT_NUMBER, '0.0.0.0');
console.log("server listening on 0.0.0.0:" + PORT_NUMBER.toString());

readline.createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', function (line) {
    socketDealer.handleServerLine(line);
});
