const express = require("express")
const fs = require("fs")

const log = console.log
const app = express()

// server file from public folder
app.use(express.static("data"))

const listdir = (req, res, next) => {
    let path = req.url.split("/").splice(1).join("/")
    let dirContents = "",
        result = "<html><head></head><body><ul>"

    if (path !== "/" && path !== "") {
        let previousDir = path.split("/")
        previousDir.pop();
        previousDir.pop()
        previousDir = previousDir.join("/")
        dirContents = `<li><a href='/${previousDir}'>../</a></li>`
    }

    fs.readdir(__dirname + '/data/' + path, { withFileTypes: true }, (err, files) => {
        if (err) return res.send("Invalid Path");
        files.forEach(file => {
            console.log(path, file.name);
            dirContents += `<li><a href='${file.name}'>${file.name}</a></li>`
        })

        result += dirContents + "</ul></body></html>"
        res.send(result)
    })
}
app.use(listdir)

app.listen(3000, () => log(`Server started at port 3000`))
