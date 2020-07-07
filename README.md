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

详细使用说明（Detail）：  
* tcp socket 测试工具 分为服务端（meserver.js）及客户端（meclient.js）
* 分为两种模式 hex 和 ascii，默认为 hex（16进制）
* 启动程序时或使用中都可以切换模式。
  * 启动时： node meserver 1881 ascii （启动tcp服务器时设置模式为 ascii）
  * 使用中： set hex 或 set ascii 进行模式切换。
* 如果不是 set + 空格 开头则说明当前操作为发送，不是设置操作。
* 发送操作 也分两种： 直接发送 及 附上crc校验码后发送。  
  * 附上crc发送示例：F60300000001 autocrc
* 处于ascii模式时，具有转义字符功能，输入 "\r\n" 或 "\r"、"\n" 可转义为换行（因为命令行无法输入回车换行）。
  * 输入 aaa\r\nbbb 将被视为 aaa + 换行回车 + bbb。
* 服务端 meserver 在使用中状态时，可以指定只向一个单独的socket连接发送 或者 向所有连接 发送。  
  * set socket list  或 set socket 显示当前所有的连接  
  * set socket all 向所有连接 发送  
  * set socket 127.0.0.1:55701 只向一个单独的socket连接发送  
  * set socket show 查看当前的发送对象的设置
  * 如果设置了只向一个连接发送，这个连接之外发送来的数据也会被过滤掉不显示出来
* 服务端 meserver 在使用中状态时，可以设置过滤器
  * set filter (无参数) 查询过滤设置 默认为 "NO_Filter" 不过滤
  * set filter aaa 过滤以 aaa 开头的数据（数据用 ascii 解码后进行比对），这里的“过滤”指的是“只显示”的意思， 即只显示以 aaa 开头的数据
  * set filter aaa|bbb 多个过滤条件，过滤以 aaa 或 bbb 开头的数据
* 过滤器 filter 可在启动时通过参数设置
  * 注意，如果filter 参数为多个过滤条件 比如 aaa|bbb ，因为 | 为shell 的 pipe（管道），所以需要使用转义字符 "\\"。 示例：node meserver 1122 ascii aaa\\|bbb
