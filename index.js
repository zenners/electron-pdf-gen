var ElectronPDF = require('electron-pdf')
var express = require('express')
var bodyParser = require('body-parser')
var app = express()

const port = process.env.PORT || 9001;

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.json())


var exporter = new ElectronPDF()
exporter.on('charged', () => {
  var hostname = '127.0.0.1'
  //Only start the express server once the exporter is ready
	app.listen(port, hostname, function() {

		console.log(`Export Server running at http://${hostname}:${port}`);
	})
})
exporter.start()



app.post('/pdfexport', function(req,res){
	// derive job arguments from request here
	//
    const jobOptions = {
      inMemory: false
    }
    const options = {
      pageSize : "A4"
    }
    // console.log('req body', req.body)
    var { links } = req.body
    var arr = [];

    links.forEach(function(item, index){
      var { source, target } = item

      exporter.createJob(source, target, options, jobOptions).then( job => {
        job.on('job-complete', (r) => {
          var newObj = {
            fileName : target, localLink : r.results[0]
          }

          arr = arr.concat(newObj)
          if(arr.length === links.length){
            console.log('final arr ', arr);
            res.send(arr)
          }
        })
        job.render()
      })
    })
})
