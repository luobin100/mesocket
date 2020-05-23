# mesocket
  A tcp socket test tool implemented by Node.js  
  
简介（Introduce）：    
一个简单的 tcp 测试工具，可以切换以16进制或Ascii发送／接受数据。  
附带自动添加CRC校验码功能，该功能在通过透传模块向 modbus 设备发送指令时非常方便。  
 （注：crc校验码为 crc16modbus，且低位字节在前高位字节在后）

安装（Install）：  
`npm install`  

使用（Usage）：  
`node meserver 1881`  
`node meclient 127.0.0.1 1881`  

详细使用说明：  
 * tcp socket 测试工具 分为服务端（meserver.js）及客户端（meclient.js）
 * 分为两种模式 hex 和 ascii，默认为 hex（16进制）
 * 启动程序时或使用中都可以切换模式。
 * 启动时： node meserver 1881 ascii （启动tcp服务器时设置模式为 ascii）
 * 使用中： set hex 或 set ascii 进行模式切换。
 * 如果不是 set + 空格 开头则说明当前操作为发送，不是设置操作。
 * 发送操作 也分两种： 直接发送 及 附上crc校验码后发送。  
 * 附上crc发送示例：F60300000001 autocrc
 * 处于ascii模式时，具有转义字符功能，输入 "\r\n" 或 "\r"、"\n" 可转义为换行（因为命令行无法输入回车换行）。
 * 示例：输入 aaa\r\nbbb 将被视为 aaa + 换行回车 + bbb。
