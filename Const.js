
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
const ALL = 'all'
const NO_FILTER = 'No_Filter'
const LIST = 'list'
const SHOW = 'show'

// 发送 hex 接受 ascii 这样的模式，生成所有有效的模式列表
const VALID_MODES = []
const SEND = 'S';
const RECV = 'R';
const HEX = 'hex';
const UTF8 = 'utf8'
// 规定只有4种合法值，hex 代表 发送接受都十六进制， ascii 同理。  ShexRascii 代表十六进制发送 ascii 接受，反之也一样。
VALID_MODES.push(HEX)
VALID_MODES.push(UTF8)
VALID_MODES.push(SEND + HEX + RECV + UTF8)
VALID_MODES.push(SEND + UTF8 + RECV + HEX)


module.exports = {
    COLOR,
    RESET_COLOR,
    ALL,
    NO_FILTER,
    LIST,
    SHOW,
    VALID_MODES,
    HEX,
    UTF8,
    SEND,
    RECV
}