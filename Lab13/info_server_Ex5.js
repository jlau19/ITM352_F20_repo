var express = require('express');
var app = express();
var myParser = require("body-parser");
var data = require('./public/product_data.js');
var products = data.products;
var fs = require('fs');

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

app.use(myParser.urlencoded({ extended: true }));
app.post("/process_form", function (request, response) {
    let POST = request.body;
    if (typeof POST['quantity_textbox'] != 'undefined') {
        let q = POST['quantity_textbox'];
        if (isNonNegInt(q)) {
            var contents = fs.readFileSync('./views/display_quantity_template.view', 'utf8');
            response.send(eval('`' + contents + '`')); // render template string
        } else {
            response.send(`${q} is not a quantity!`);
        }
    }
});

app.get('/test', function (request, response, next) {
    response.send("Got a GET to /test path");
    next();
});

app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here

function process_quantity_form(POST, response) {
    if (typeof POST['purchase_submit_button'] != 'undefined') {
        var contents = fs.readFileSync('./views/display_quantity_template.view', 'utf8');
        receipt = '';
        for (i in products) {
            let q = POST[`quantity_textbox${i}`];
            let model = products[i]['model'];
            let model_price = products[i]['price'];
            if (isNonNegInt(q)) {
                receipt += eval('`' + contents + '`'); // render template string
           ß } else {
                receipt += `<h3><font color="red">${q} is not a valid quantity for ${model}!</font></h3>`;
            }
        }
        response.send(receipt);
        response.end();
    }
}

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