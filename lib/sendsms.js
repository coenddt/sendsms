var EventEmitter = require('events').EventEmitter;
var http = require("http");

var events = {
    SMSSERVERERROR: "smsServerError",
    SMSSERVEROK: "ok",
    PARSEERROR: "parseError",
    HTTPERROR: "httpError",
    PARAMSERROR: "paramsError"
};

var SendSms = module.exports = function () {
    this.event = new EventEmitter();
    this.options = {};
}

var sendSmsHandler = SendSms.prototype;

sendSmsHandler.setOptions = function (options) {
    for (var key in options) {
        if (options[key])
            this.options[key] = options[key]
    }
}

sendSmsHandler.sendByMobile = function (mobile, content, cb) {
    var _self = this;
    var body = "mobile=" + mobile + "&content=" + content;
    var options = {
        host: this.options.host || "",
        port: this.options.port || "",
        path: this.options.path || "",
        method: this.options.method || "",
        headers: {
            'Content-Type': this.options.contentType || "",
            'Content-Length': Buffer.byteLength(body)
        }
    };

    var request = http.request(options, function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            try {
                chunk = JSON.parse(chunk) || {};
            } catch (e) {
                chunk = null
                _self.event.emit(events.PARSEERROR, e, { mobile: mobile, content: content, chunk: chunk }, cb)
            }
            if (chunk) {
                var statusCode = chunk.statusCode || 0;
                if (statusCode == 1) {
                    _self.event.emit(events.SMSSERVEROK, { mobile: mobile, content: content, statusCode: statusCode }, cb)
                } else if (statusCode == 2) {
                    _self.event.emit(events.PARAMSERROR, "PARAMSERROR", { mobile: mobile, content: content, statusCode: statusCode }, cb)
                } else {
                    _self.event.emit(events.SMSSERVERERROR, "SMSSERVERERROR", { mobile: mobile, content: content, statusCode: statusCode }, cb)
                }
            }
        });
    });

    request.on('error', function (e) {
        _self.event.emit(events.HTTPERROR, e, { options: options }, cb)
    });
    request.write(body);
    request.end();
}