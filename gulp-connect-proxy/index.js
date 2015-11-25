var url = require('url');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var extend = require('extend');


function proxyRequest(localRequest, localResponse, next) {

    var params = url.parse(localRequest.url, true);

    var headers = localRequest.headers;
    headers.host = params.host;

    console.log("headers.host = " + headers.host);

    var reqOptions = {
        host: params.host.split(":")[0],
        port: params.port ? params.port : 80,
        path: params.path,
        headers: headers,
        method: localRequest.method
    };

    console.log('reqOptions.port = ' + reqOptions.port);

    var httpLib = params.protocol === 'https:' ? https : http;

    // change port if https
    reqOptions.port = params.protocol === 'https:' ? 443 : 80;

    var req = httpLib.request(reqOptions, function (res) {

        console.log(res.req.method, res.req.path);
        var resHeaders = res.headers;

        localResponse.writeHead(200, resHeaders);

        var body = "";
        res.on('data', function (data) {
            body += data;
            localResponse.write(data);
        });
        res.on('end', function () {
            localResponse.end();

        });
    });
    req.on('error', function (e) {
        console.log('An error occured: ' + e.message);
        localResponse.writeHead(503);
        localResponse.write("Error!");
        localResponse.end();
    });

    if (/POST|PUT/i.test(localRequest.method)) {
        localRequest.pipe(req);
    } else {
        req.end();
    }

};

function Proxy(options) {
    var config = extend({}, {
        route: ''
    }, options);

    return function (localRequest, localResponse, next) {
        if (typeof config.root === 'string') {
            config.root = [config.root]
        } else if (!Array.isArray(config.root)) {
            throw new Error('No root specified')
        }

        var pathChecks = []
        config.root.forEach(function (root, i) {
            var p = path.resolve(root) + localRequest.url;

            fs.access(p, function (err) {
                pathChecks.push(err ? false : true)
                if (config.root.length == ++i) {
                    var pathExists = pathChecks.some(function (p) {
                        return p;
                    });
                    if (pathExists) {
                        next();
                    } else {
                        if (localRequest.url.slice(0, config.route.length) === config.route) {
                            localRequest.url = config.context + localRequest.url.slice(config.route.length);
                            proxyRequest(localRequest, localResponse, next);
                        } else {
                            return next();
                        }
                    }
                }
            });
        })
    }
}

module.exports = Proxy;
