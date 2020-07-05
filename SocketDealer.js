const util = require("luoutil");
const myCRC = require("./myCRC");

const COLOR = {
    'bright'    : '\x1B[1m', // 亮色
    'grey'      : '\x1B[2m', // 灰色
    'italic'    : '\x1B[3m', // 斜体
    'underline' : '\x1B[4m', // 下划线
    'reverse'   : '\x1B[7m', // 反向
    'hidden'    : '\x1B[8m', // 隐藏
    'black'     : '\x1B[30m', // 黑色
    'red'       : '\x1B[31m', // 红色
    'green'     : '\x1B[32m', // 绿色
    'yellow'    : '\x1B[33m', // 黄色
    'blue'      : '\x1B[34m', // 蓝色
    'magenta'   : '\x1B[35m', // 品红
    'cyan'      : '\x1B[36m', // 青色
    'white'     : '\x1B[37m', // 白色
    'blackBG'   : '\x1B[40m', // 背景色为黑色
    'redBG'     : '\x1B[41m', // 背景色为红色
    'greenBG'   : '\x1B[42m', // 背景色为绿色
    'yellowBG'  : '\x1B[43m', // 背景色为黄色
    'blueBG'    : '\x1B[44m', // 背景色为蓝色
    'magentaBG' : '\x1B[45m', // 背景色为品红
    'cyanBG'    : '\x1B[46m', // 背景色为青色
    'whiteBG'   : '\x1B[47m' // 背景色为白色
}

const RESET_COLOR = '\x1B[0m' // \x1B[0m 表示重置终端颜色，使其在此之后不再继续成为所选颜色；

class SocketDealer {
    // socket     客户端需要用到，连接的socket
    // mode       发送接受数据模式 hex：16进制； ascii：ascii字符。 默认16进制。
    // socketPool 服务器端需要用到，所有连接的socket数组 （optional）
    // socketValue 服务器端需要用到，all 还是 单独的socket（ip+端口号） （optional）
    constructor (socket, mode, socketPool, socketValue) {
        this._socket = socket;
        this._mode = mode;
        this._socketPool = socketPool;
        this._socketValue = "all"; // 发送对象socket 初始值设为 all，因为 client 不会管这个属性，也没事。
    }

    chkSetMode (line) {
        let action;

        // 输入示例：
        // set ascii
        // set hex
        // f60300000001 autocrc
        // f60300000001914d

        const inputs = line.split(" ");
        if (inputs[0] === "set") {
            action = "set"
        } else {
            action = "send"
        }

        // set 设置模式
        if (action === "set") {
            const mode = inputs[1];
            if (mode === "ascii") {
                this._mode = "ascii";
                console.log("模式设置成功，已切换为：" + this._mode);
            } else if (mode === "hex") {
                this._mode = "hex";
                console.log("模式设置成功，已切换为：" + this._mode);
            }

            return true;
        } else {
            return false;
        }
    }


    chkSetModeValid (line) {
        let action;
        const inputs = line.split(" ");
        if (inputs[0] === "set") {
            action = "set"
        } else {
            action = "send"
        }

        if (action === "set") {
            const mode = inputs[1];
            if (mode !== "hex" && mode !== "ascii") {
                console.log("请输入以下两种模式： ascii 或 hex；"+" 当前模式：" + this._mode);
            }
            return true;
        } else {
            return false;
        }
    }

    isValidIP (str) {
        const arr = str.split(".")
        if (arr.length !== 4) {
            return false
        }
        const isAllValidIPNum = arr.some(function (numStr) {
            const num = parseInt(numStr)
            // 如果不是数字，直接返回不是有效ip
            if (isNaN(num)) {
                return false
            }
            const isInRange = num >= 0 && num <= 255
            if (!isInRange) {
                return false
            }
            return true
        })
        if (!isAllValidIPNum) {
            return false
        }

        return true
    }

    isValidPort (str) {
        const port = parseInt(str)
        // 如果不是数字，直接返回不是有效端口号
        if (isNaN(port)) {
            return false
        }
        const isInRange = port >= 1 && port <= 65535
        if (!isInRange) {
            return false
        }
        return true
    }

    isValidIPPort (str) {
        const arr = str.split(":")
        if (arr.length !== 2) {
            return false
        }
        const ip = arr[0]
        const port = arr[1]
        return this.isValidIP(ip) && this.isValidPort(port)
    }

    chkSetSocket (line) {
        let action;

        // 输入示例：
        // set socket list  或 set socket 显示当前所有的连接
        // set socket all
        // set socket 127.0.0.1:55701

        const inputs = line.split(" ");
        if (inputs[0] === "set") {
            action = "set"
        } else {
            action = "send"
        }

        if (action === "set") {
            const setProp = inputs[1]
            if (setProp === "socket") {
                const setValue = inputs[2]
                if (!setValue || setValue === "show") { // 没有写socket值 或 show
                    console.log("查询发送对象设置，当前socket对象为：" + this._socketValue);
                } else if (setValue === "list") { // 列出所有socket
                    this._socketPool.forEach(s => console.log(s.remoteAddress + ":" + s.remotePort))
                } else if (setValue === "all") { // 设为向所有连接发送
                    this._socketValue = setValue
                    console.log("发送对象设置成功，socket对象为：" + this._socketValue);
                } else if (this.isValidIPPort(setValue)) { // 输入的是有效的ip:端口号
                    this._socketValue = setValue
                    console.log("发送对象设置成功，socket对象为：" + this._socketValue);
                } else {
                    console.log("设置发送对象请输入以下4种值：list、 all、show 或 有效的ip+端口号；"+" 当前发送对象：" + this._socketValue);
                }
            }
            return true;
        } else {
            return false;
        }
    }

    handleLine (socket=this._socket, line) {
        const prefixStr = `${COLOR.grey}Send to ${socket.remoteAddress}:${socket.remotePort}>${RESET_COLOR}`
        // 发送模式
        if (this._mode === "hex") {
            let sendData;
            // 自动生成crc option
            var [command, option] = line.split(" ");
            if(option === "autocrc"){
                sendData = myCRC.bufAppendCRC(Buffer.from(command, "hex"));
            } else {
                sendData = Buffer.from(line, "hex");
            }
            socket.write(sendData);
            console.log(prefixStr + COLOR.blue + sendData.toString("hex") + RESET_COLOR);

        } else if (this._mode === "ascii") {

            // 添加转义字符的功能，让用户可在终端命令行输入回车换行 \r\n
            line = line.replace(/\\r/g, "\r").replace(/\\n/g, "\n");

            let sendData;
            sendData = Buffer.from(line, "ascii");
            socket.write(sendData);
            const asciiStr = sendData.toString("ascii");
            console.log(prefixStr + COLOR.blue + asciiStr + RESET_COLOR);
        } else {
            throw new Error("该模式不存在：" + this._mode);
        }

    }
    handleData (socket=this._socket, data) {
        const prefixStr = `${COLOR.grey}Received from ${socket.remoteAddress}:${socket.remotePort}>${RESET_COLOR}`
        if (this._mode === "hex") {
            console.log(prefixStr + COLOR.green + data.toString("hex") + RESET_COLOR);
        } else if (this._mode === "ascii") {
            console.log(prefixStr + COLOR.green + data.toString("ascii") + RESET_COLOR);
        } else {
            throw new Error("该模式不存在：" + this._mode);
        }
    }
    handleClientLine (line) {
        const isSetMode = this.chkSetMode(line);
        const isSetModeValid = this.chkSetModeValid(line);
        if (isSetMode || isSetModeValid) {
            return;
        }
        this.handleLine(undefined, line);
    }
    handleServerLine (line) {
        const isSetMode = this.chkSetMode(line);
        const isSetSocket = this.chkSetSocket(line);
        if (isSetMode || isSetSocket) {
            return;
        }
        if (this._socketValue === "all") {
            this._socketPool.forEach((socket) => {
                this.handleLine(socket, line);
            })
        } else { // 单独的socket （注：前面验证过了，只会有 all 和 validIPPort 两种形式）
            const socket = this._socketPool.find(s => s.remoteAddress + ":" + s.remotePort === this._socketValue)
            this.handleLine(socket, line);
        }
    }

    // 根据是否是全发还是单发，过滤接受到的数据。
    // 也就是单独发，也单独收那个设置的socket连接。
    handleServerData (socket, data) {
        if (this._socketValue === "all") {
            this.handleData(socket, data)
        } else {
            if (socket.remoteAddress + ":" + socket.remotePort === this._socketValue) {
                this.handleData(socket, data)
            } else {
                // do nothing 过滤掉其他socket发来的数据
            }
        }
    }
}


module.exports = SocketDealer;
