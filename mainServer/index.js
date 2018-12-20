/*
 *
 * Primary file for the API 
 *
 */

const http = require('http');
const express = require('express');
const axios = require('axios');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config');
const fs = require('fs');
const app = express();
var upload = require('express-fileupload');
app.use(upload());
app.use(express.static("data"))

let handlers = {};
app.listen(config.port, function() {
    console.log("The server is started on port " + config.port + "in " + config.envName);
})

app.get("/getFilesAndFolders",function(req, res) {
    let parsedURL = url.parse(req.url, true);
    let path = parsedURL.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    let queryStringObj = parsedURL.query;
    let method = req.method.toLowerCase();
    let headers = req.headers;
    let decoder = new StringDecoder('utf-8');
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObj': (queryStringObj),
            'method': method,
            'header': (headers),
        }
		
        handlers.getAllFilesFromFolder(data, function(statusCode, payload) {
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
		payload = (typeof(payload) == 'object'||typeof(payload)==='string') ? payload : {};
        let payloadString = JSON.stringify(payload);
        res.status(statusCode).send(payloadString);
        console.log("returning this response  ", statusCode, payloadString);
        })
});

app.get("/upload", (req, res) => {
    res.sendFile(__dirname + '/main.html');
})

app.post("/", (req, res) => {
	console.log(req.files);
    if (req.files) {
		console.log(req.files);
        var file = req.files.filename;
        var filename = file.name;
        file.mv('./upload/' + filename, (err) => {
            if (err) {
                console.log(err);
                res.send("Error occured while uploading");
            } else {
                console.log("Successfully uploaded");
                res.send("Done");
            }
        })
    }
})

	const listdir = (req, res) => {
	console.log("URL IS", (req.url).split('/'));
    let path = req.url.split("/").splice(1).join("/")
    let dirContents = "",
        result = "<html><head></head><body><ul>"

    if (path !== "/" && path !== "") {
        let previousDir = path.split("/")
		//let checkRoot = path[0].indexOf('/')===-1?console.log('root'):console.log('not root');
        previousDir.pop();
        previousDir.pop()
        previousDir = previousDir.join("/")
        dirContents = `<li><a href='/${previousDir}'>../</a></li>`
    }
    fs.readdir(__dirname + '/data/' + path, { withFileTypes: true }, (err, files) => {
		
        if (err) return res.send("Invalid Path");
        files.forEach(file => {
			console.log(file.name);
            //console.log(path, file.name);
            dirContents += `<li><a href='${file.name}'>${file.name}</a></li>`
        })

        result += dirContents + "</ul></body></html>"
        res.send(result)
    })
	}

app.use(listdir)

app.use((req,res)=>{
	res.send("Invalid Route");
}
	)



//Handlers Object
handlers.getAllFilesFromFolder = function(data, callback) {
    var result = [];
    let dir = data.queryStringObj.folderName;
    console.log(dir);
        fs.readdir("./" + dir, {
                withFileTypes: true
            }, (err, files) => {
                if (err) {
                   callback(200,"No such folder found in root")
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
     
};
