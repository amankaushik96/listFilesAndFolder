var express = require('express');
var app = express();
var http = require('http').Server(app).listen(3000);
var upload = require('express-fileupload');
app.use(upload());

console.log("server started");
app.get("/upload", (req, res) => {
    res.sendFile(__dirname + '/main.html');
})

app.post("/", (req, res) => {
    if (req.files) {
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