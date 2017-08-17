var ElectronPDF = require('electron-pdf')
var express = require('express')
var bodyParser = require('body-parser')
var app = express()

const port = process.env.PORT || 9001;

app.use(bodyParser.json())

var exporter = new ElectronPDF()
exporter.on('charged', () => {
  var hostname = ''
  //Only start the express server once the exporter is ready
	app.listen(port, hostname, function() {

		console.log(`Export Server running at http://${hostname}:${port}`);
	})
})
exporter.start()

app.post('/pdfexport', function(req,res){
	// derive job arguments from request here
	//
  const { source, target } = req.body
	const jobOptions = {
	  /**
	    r.results[] will contain the following based on inMemory
          false: the fully qualified path to a PDF file on disk
          true: The Buffer Object as returned by Electron

	    Note: the default is false, this can not be set using the CLI
	   */
	  inMemory: false
	}
	const options = {
  		pageSize : "A4"
	}
	exporter.createJob(source, target, options, jobOptions).then( job => {
	job.on('job-complete', (r) => {
    		console.log('pdf files:', r.results)
        res.send(r.results)

    		// Process the PDF file(s) here
    	})
    	job.render()
	})
})
