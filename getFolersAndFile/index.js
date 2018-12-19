/*
 *
 * Primary file for the API 
 *
 */

let http = require('http');
let express = require('express');
let axios = require('axios');
let url = require('url');
let StringDecoder = require('string_decoder').StringDecoder
let config = require('./config');
let fs = require('fs');

let server = http.createServer(function(req, res) {
    let parsedURL = url.parse(req.url, true);
    let path = parsedURL.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let queryStringObj = parsedURL.query;
    let method = req.method.toLowerCase();
    let headers = req.headers;
    let decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    })
    req.on('end', function() {
        buffer += decoder.end();

        //Choose the handler this request should go to
        let chosenHandler = router[trimmedPath] || handlers.notFound;
        console.log(chosenHandler);
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObj': (queryStringObj),
            'method': method,
            'header': (headers),
            'payload': buffer
        }

        chosenHandler(data, function(statusCode, payload) {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            let payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log("returning this response  ", statusCode, payloadString);
        })

        //console.log("Request received on this path:" + trimmedPath + " with this method  " + method + " with these query string parameters :" + JSON.stringify(queryStringObj) +
        //  "with headers " + JSON.stringify(headers));
    })

});

server.listen(config.port, function() {
    console.log("The server is started on port " + config.port + "in " + config.envName);
})

//Handlers Object
let handlers = {};

//Defining handlers
handlers.sample = function(data, callback) {
    callback(406, {
        name: "sample handler"
    })
};

handlers.getAllFilesFromFolder = function(data, callback) {
    var result = [];
    // console.log(data);
    let dir = data.queryStringObj.folderName;
    console.log(dir);
    //  let baseDir = getFolder.getAllFilesFromFolder(__dirname, dir);
    if (dir !== undefined) {
        fs.readdir("./" + dir, {
                withFileTypes: true
            }, (err, files) => {
                if (err) {
                    console.log("No such directory found");
                } else {
                    files.forEach(file => {
                        var name = file.name;
                        file.isDirectory() ? result.push({ 'Directory': name }) : result.push({ 'File': name });
                        console.log(`${file.name} - ${file.isDirectory() ? 'directory' : 'file'}`);
                    })
                    callback(200, result);
                }
            })
            // console.log(JSON.stringify(result));
    } else {
        callback(404);
    }
};

handlers.downloadItems = function(data, callback) {

};

//Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
    return;
};

//Handler router
let router = {
    'sample': handlers.sample,
    'getFilesAndFolders': handlers.getAllFilesFromFolder,
    //'download': handlers.downloadItems
}