// Require packages and set the port
const express = require('express');
const cors = require('cors')
const port = 3000;
const bodyParser = require('body-parser');
const app = express();	
const routes = require('./routes/routes');
var fileupload = require("express-fileupload");
const path = require('path')

// Use Node.js body parsing middleware
app.use(cors())
app.use(fileupload())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
}));

app.use(express.static(__dirname + '/images'));
routes(app);

// Start the server
const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
 
    console.log(`Server listening on port ${server.address().port}`);
});
