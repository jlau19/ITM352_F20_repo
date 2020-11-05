var express = require('express');
var app = express();
var myParser = require("body-parser");

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

app.use(myParser.urlencoded({ extended: true }));
app.post("/process_form", function (request, response) {
   let POST = request.body;
   if(isNonNegInt(POST["quantity_textbox"])) {
        response.send(`Thank you for ordering ${POST["quantity_textbox"]} items!`);
    } else {
        response.send(`Hey! ${POST["quantity_textbox"]} is not valid!}`)
    }     
});

app.get('/test', function (request, response, next) {
    response.send("Got a GET to /test path");
    next();
});

app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here

function isNonNegInt(val, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(val) != val) {
        errors.push('Not a number!');// Check if string is a number value
    } else {
        if (val < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(val) != val) errors.push('Not an integer!'); // Check that it is an integer
    }
    return returnErrors ? errors : ((errors.length > 0) ? false : true);
}