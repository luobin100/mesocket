const util = require("luoutil");
const myCRC = require("./myCRC");
const {ALL, NO_FILTER, SHOW, LIST, COLOR, RESET_COLOR, VALID_MODES, UTF8, HEX, SEND, RECV} = require("./Const")

class SocketDealer {
    // socket     客户端需要用到，连接的socket
    // mode       发送接受数据模式 hex：16进制； utf8：utf8字符串。 默认16进制。
    // socketPool 服务器端需要用到，所有连接的socket数组 （optional）
    // socketValue 服务器端需要用到，all 还是 单独的socket（ip+端口号） （optional）
    // filterValue 服务器端需要用到，过滤器，指定哪些字符串开头的数据才显示 （optional）
    // timestamp  是否显示时间 on 或 off（optional）
    constructor (socket, mode, socketPool, socketValue, filterValue, timestamp) {
        this._socket = socket;
        this._mode = mode; // ATTENTION: mode 的命名不加 Value，故意这样设计的。因为以后有可能全部改为这种的形式。
        this._socketPool = socketPool;
        this._socketValue = ALL; // 发送对象socket 初始值设为 all，因为 client 不会管这个属性，也没事。
        this._filterValue = filterValue // server端 filter 初始值设为 No_Filter,即“不过滤”的意思。 
        this._timestamp = timestamp 
    }

    chkSetMode (line) {
        let action;

        // 输入示例：
        // set mode utf8
        // set mode hex

        const inputs = line.split(" ");
        if (inputs[0] === "set") {
            action = "set"
        } else {
            action = "send"
        }

        // set 设置模式
        if (action === "set") {
            const setProp = inputs[1]
            if (setProp === "mode") {
                const setValue = inputs[2]
                if (!setValue) { // 没有写mode值 set mode 表示查询当前设置值
                    console.log("查询模式设置，当前模式设置为：" + this._mode);
                } else if (VALID_MODES.indexOf(setValue) >= 0) {
                    this._mode = setValue
                    console.log("模式设置成功，已切换为：" + this._mode);
                } else {
                    console.log("请输入有效的模式值！当前模式设置为：" + this._mode);
                }
            }
            return true;
        } else {
            return false;
        }
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
                if (!setValue || setValue === SHOW) { // 没有写socket值 或 show
                    console.log("查询发送对象设置，当前socket对象为：" + this._target);
                } else if (setValue === LIST) { // 列出所有socket
                    this._socketPool.forEach(s => console.log(s.remoteAddress + ":" + s.remotePort))
                } else if (setValue === ALL) { // 设为向所有连接发送
                    this._socketValue = setValue
                    console.log("发送对象设置成功，socket对象为：" + this._socketValue);
                } else if (util.isValidIPPort(setValue)) { // 输入的是有效的ip:端口号
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

    chkSetFilter (line) {
        let action;

        // 输入示例：
        // set filter aaa       只显示以aaa开头的数据
        // set filter aaa|bbb   只显示以aaa 或 bbb 开头的数据  

        const inputs = line.split(" ");
        if (inputs[0] === "set") {
            action = "set"
        } else {
            action = "send"
        }

        if (action === "set") {
            const setProp = inputs[1]
            if (setProp === "filter") {
                const setValue = inputs[2]
                if (!setValue) { // 没有写filter值 set filter 表示查询当前设置值
                    console.log("查询过滤设置，当前过滤设置为：" + this._filterValue);
                } else {
                    this._filterValue = setValue
                    // 添加转义字符的功能，让用户可以输入回车换行 \r\n 的过滤字符串
                    this._filterValue = this._filterValue.replace(/\\r/g, "\r").replace(/\\n/g, "\n");
                    console.log("设置过滤成功，当前过滤设置为：" + this._filterValue);
                }
            }
            return true;
        } else {
            return false;
        }
    }

    chkSetTimestamp (line) {
        let action;

        // 输入示例：
        // set timestamp on  开启显示时间
        // set timestamp off 关闭显示时间

        const inputs = line.split(" ");
        if (inputs[0] === "set") {
            action = "set"
        } else {
            action = "send"
        }

        if (action === "set") {
            const setProp = inputs[1]
            if (setProp === "timestamp") {
                const setValue = inputs[2]
                if (!setValue) { // 没有写值 表示查询当前设置值
                    console.log("查询显示时间设置，当前显示时间设置为：" + this._timestamp);
                } else if (setValue === "on" || setValue === "off") { // 输入的是有效值
                    this._timestamp = setValue
                    console.log("显示时间设置成功，显示时间设置为：" + this._timestamp);
                } else {
                    console.log("设置显示时间请输入以下2种值：on 或 off；"+" 当前显示时间设置为：" + this._timestamp);
                }
            }
            return true;
        } else {
            return false;
        }
    }

    handleLine (socket=this._socket, line) {
        let prefixStr = `${COLOR.grey}Send to ${socket.remoteAddress}:${socket.remotePort}>${RESET_COLOR}`
        if (this._timestamp === "on") {
            const timeStr = `${COLOR.grey}[${util.timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss.S")}]# ${RESET_COLOR}`
            prefixStr = timeStr + prefixStr
        }
        // 发送模式
        if (this._mode === HEX || this._mode === SEND + HEX + RECV + UTF8) {
            let sendData;
            // 自动生成crc option
            var [command, option] = line.split(" ");
            if(option === "autocrc"){
                sendData = myCRC.bufAppendCRC(Buffer.from(command, HEX));
            } else {
                sendData = Buffer.from(line, "hex");
            }
            socket.write(sendData);
            console.log(prefixStr + COLOR.blue + sendData.toString("hex") + RESET_COLOR);

        } else if (this._mode === UTF8 || this._mode === SEND + UTF8 + RECV + HEX) {

            // 添加转义字符的功能，让用户可在终端命令行输入回车换行 \r\n
            line = line.replace(/\\r/g, "\r").replace(/\\n/g, "\n");

            let sendData;
            sendData = Buffer.from(line, "utf8");
            socket.write(sendData);
            const str = sendData.toString("utf8");
            console.log(prefixStr + COLOR.blue + str + RESET_COLOR);
        } else {
            throw new Error("该模式不存在：" + this._mode);
        }

    }
    handleData (socket=this._socket, data) {
        let prefixStr = `${COLOR.grey}Received from ${socket.remoteAddress}:${socket.remotePort}>${RESET_COLOR}`
        if (this._timestamp === "on") {
            const timeStr = `${COLOR.grey}[${util.timeFormat(new Date(), "yyyy-MM-dd hh:mm:ss.S")}]# ${RESET_COLOR}`
            prefixStr = timeStr + prefixStr
        }
        if (this._mode === HEX || this._mode === SEND + UTF8 + RECV + HEX) {
            console.log(prefixStr + COLOR.green + data.toString("hex") + RESET_COLOR);
        } else if (this._mode === UTF8 || this._mode === SEND + HEX + RECV + UTF8) {
            console.log(prefixStr + COLOR.green + data.toString("utf8") + RESET_COLOR);
        } else {
            throw new Error("该模式不存在：" + this._mode);
        }
    }
    handleClientLine (line) {
        const isSetMode = this.chkSetMode(line);
        const isSetFilter = this.chkSetFilter(line);
        const isSetTimestamp = this.chkSetTimestamp(line);
        if (isSetMode || isSetFilter || isSetTimestamp) {
            return;
        }
        this.handleLine(undefined, line);
    }
    handleServerLine (line) {
        const isSetMode = this.chkSetMode(line);
        const isSetSocket = this.chkSetSocket(line);
        const isSetFilter = this.chkSetFilter(line);
        const isSetTimestamp = this.chkSetTimestamp(line);
        if (isSetMode || isSetSocket || isSetFilter || isSetTimestamp) {
            return;
        }
        if (this._socketValue === ALL) {
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
        // set filter 过滤
        if (this._filterValue !== NO_FILTER) {
            // 检查过滤条件 比如 aaa|bbb 将只显示 以aaa、bbb开头的数据
            const filters = this._filterValue.split("|")
            const isHit = filters.some(v => data.toString("utf8").indexOf(v) === 0)
            if (!isHit) {
                return;
            }
        }

        // set socket 过滤
        if (this._socketValue === ALL) {
            this.handleData(socket, data)
        } else {
            if (socket.remoteAddress + ":" + socket.remotePort === this._socketValue) {
                this.handleData(socket, data)
            } else {
                // do nothing 过滤掉其他socket发来的数据
            }
        }
    }

    handleClientData (socket, data) {
        // set filter 过滤
        if (this._filterValue !== NO_FILTER) {
            // 检查过滤条件 比如 aaa|bbb 将只显示 以aaa、bbb开头的数据
            const filters = this._filterValue.split("|")
            const isHit = filters.some(v => data.toString("utf8").indexOf(v) === 0)
            if (!isHit) {
                return; // 直接返回，不显示数据（即 过滤）
            }
        }
        // 上面的情况不符合 就可以打印
        this.handleData(socket, data);
    }
}


module.exports = SocketDealer;
