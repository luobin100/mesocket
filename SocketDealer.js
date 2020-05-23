const util = require("luoutil");
const myCRC = require("./myCRC");


class SocketDealer {
    // socket     客户端需要用到，连接的socket
    // mode       发送接受数据模式 hex：16进制； ascii：ascii字符。 默认16进制。
    // socketPool 服务器端需要用到，所有连接的socket数组 （optional）
    constructor (socket, mode, socketPool) {
        this._socket = socket;
        this._mode = mode;
        this._socketPool = socketPool;
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
                console.log("模式设置成功，已切换为："+this._mode);
            } else if (mode === "hex") {
                this._mode = "hex";
                console.log("模式设置成功，已切换为："+this._mode);
            } else {
                console.log("请输入以下两种模式： ascii 或 hex；"+" 当前模式："+this._mode);
            }

            return true;
        } else {
            return false;
        }
    }
    handleLine (socket=this._socket, line) {

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
            console.log("Send: "+sendData.toString("hex"));

        } else if (this._mode === "ascii") {

            // 添加转义字符的功能，让用户可在终端命令行输入回车换行 \r\n
            line = line.replace(/\\r/g, "\r").replace(/\\n/g, "\n");

            let sendData;
            sendData = Buffer.from(line, "ascii");
            socket.write(sendData);
            const asciiStr = sendData.toString("ascii");
            console.log("Send: "+asciiStr);
        } else {
            throw new Error("该模式不存在：" + this._mode);
        }

    }
    handleData (data) {
        if (this._mode === "hex") {
            console.log('Received: ' + data.toString("hex"));
        } else if (this._mode === "ascii") {
            console.log('Received: ' + data.toString("ascii"));
        } else {
            throw new Error("该模式不存在：" + this._mode);
        }
    }
    handleClientLine (line) {
        const isSetMode = this.chkSetMode(line);
        if (isSetMode) {
            return;
        }
        this.handleLine(undefined, line);
    }
    handleServerLine (line) {
        const isSetMode = this.chkSetMode(line);
        if (isSetMode) {
            return;
        }
        // util.forEachTime(this._socketPool, (socket) => {
        //     this.handleLine(socket, line);
        // }, 1000)
        this._socketPool.forEach((socket) => {
            this.handleLine(socket, line);
        })
    }
}


module.exports = SocketDealer;
