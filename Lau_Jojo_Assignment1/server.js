var express = require('express');
var app = express();
var myParser = require("body-parser");
var fs = require('fs');
var data = require('./products.json');
var products = data.products;

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

app.use(myParser.urlencoded({ extended: true }));

app.post("/process_form", function (request, response) {
    process_quantity_form(request.body, response);
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

function process_quantity_form (POST, response) {
    if (typeof POST['purchase_submit_button'] != 'undefined') {
        var contents = fs.readFileSync('./views/display_quantity_template.view', 'utf8');
        receipt = '';
        for(i in products) {
            let val = POST[`quantity_textbox${i}`];
            let product_name = products[i][`name`];
            let product_price = products[i]['price'];
            if(isNonNegInt(val)) {
                receipt += eval('`' + contents + '`');
            } else {
                receipt += `<h3><font color="red">${val} is not a valid quantity for ${product_name}!</font></h3>`
            }
        }
        response.send(receipt);
        response.end();
    }
}