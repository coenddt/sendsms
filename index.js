var sendSms = require("./lib/sendsms")

module.exports.createConn = function (options) {
    var sendSmsObj = new sendSms()
    sendSmsObj.setOptions(options)
    return sendSmsObj
}