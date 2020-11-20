/* Coded by Jojo Lau, ITM 352, UH Manoa Fall 2020.
Special thanks to Professor Dan Port for the screencast helps and examples on this assignment! All codes modified from previous labs and from screencast examples unless specified. Login form and register form modified from W3Schools template. */

// To access code from node packages
var express = require('express');
var myParser = require("body-parser");
var products = require("./products.json");
var fs = require('fs');
// Create an express app with reference to express
var app = express();
// Popup alert idea from stackoverflow.com by users Pranav and Kiran Mistry
var alert = require('alert');
const { type } = require('os');
const { nextTick } = require('process');
var quantity_data;

const user_data_filename = 'user_data.json';

// check if file exists before reading
if (fs.existsSync(user_data_filename)) {
    stats = fs.statSync(user_data_filename);

    var data = fs.readFileSync(user_data_filename, 'utf-8');
    users_reg_data = JSON.parse(data);
}

// Parse body of requests with application/x-www-form-urlencoded content type
app.use(myParser.urlencoded({ extended: true }));

// Response when /store is requested
app.get("/store", function (request, response) {
    var contents = fs.readFileSync('./views/store.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    // Calls on this function to display products in /store page
    function display_products() {
        str = '';
        for (i = 0; i < products.length; i++) {
            str += `
                <section class="item">
                    <h3>${products[i].name}</h3>
                    <p><img src="${products[i].image}"></p>
                    <p>$${products[i].price.toFixed(2)}</p>
                    <p><label id="quantity${i}_label"}">Quantity:</label></p>
                    <p><input type="text" placeholder="Enter amount" name="quantity${i}"
                    onkeyup="checkQuantityTextbox(this);"></p>
                </section>
            `;
        }
        return str;
    }
});

// Response when /login is requested
app.get("/login", function (request, response) {
    var contents = fs.readFileSync('./views/login.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string
});

// Function to check whether a quantity is a non-negative integer
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(q) != q) errors.push('Not a number!');// Check if string is a number value
    if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
    return returnErrors ? errors : ((errors.length > 0) ? false : true);
};

// old code
/*app.post("/process_invoice", function (request, response) {
    let POST = request.body;
    quantity_data = POST;

    if (typeof POST['purchase_submit'] != 'undefined') {
        // Validates that form has quantities
        for (i = 0; i < products.length; i++) {
            var val = POST[`quantity${i}`];

            // If there is at least one valid quantity that is a non-negative integer, will redirect to login. Otherwise, alert will pop up to try again.
            if (val > 0 && isNonNegInt(val) == true) {
                response.redirect('./login');
                break;
            } else {
                alert('Enter valid quantities!');
                break;
            }
        }
    }
});*/

// Response when /process_invoice is requested, when purchase form is submitted
app.post("/process_invoice", function (request, response) {
    let POST = request.body;
    quantity_data = POST;

    if (typeof POST['purchase_submit'] != 'undefined') {
        errs = [];
        // Validates that form has quantities
        for (i = 0; i < products.length; i++) {
            var val = POST[`quantity${i}`];

            // If there is at least one valid quantity that is a non-negative integer, will redirect to login. Otherwise, alert will pop up to try again.
            if (val <= 0) {
                errs.push('Enter a quantity!');
            }
            if (isNonNegInt(val) == false) {
                errs.push('Make sure quantities are valid!');
            }
            if (errs.length > 0) {
                alert(`**ERROR** ${errs.join(' ')}`);
                break;
            }
            if (errs.length == 0) {
                response.redirect('./login');
                break;
            }
        }
    }
});

// Response when process_login is requested from login
app.post("/process_login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    var POST = request.body;
    console.log(quantity_data);
    // if user exists, get their password
    if (typeof users_reg_data[request.body.username] != 'undefined' && typeof quantity_data != 'undefined') {
        if (request.body.password == users_reg_data[request.body.username].password) {
            var contents = fs.readFileSync('./views/invoice.template', 'utf8');
            response.send(eval('`' + contents + '`')); // render template string

            // Calls on this function to display invoice table
            function display_invoice_table_rows() {
                subtotal = 0;
                str = '';
                for (i = 0; i < products.length; i++) {
                    qty = 0;
                    val = quantity_data[`quantity${i}`];

                    if (isNonNegInt(val)) {
                        qty = val;
                    }
                    if (qty > 0) {
                        // product row
                        extended_price = qty * products[i].price
                        subtotal += extended_price;
                        str += (`
      <tr>
        <td align="center" width="43%">${products[i].name}</td>
        <td align="center" width="11%">${qty}</td>
        <td align="center" width="13%">\$${products[i].price}</td>
        <td align="center" width="54%">\$${extended_price}</td>
      </tr>
      `);
                    }
                }
                // Compute tax
                tax_rate = 0.0575;
                tax = tax_rate * subtotal;

                // Compute shipping
                if (subtotal <= 50) {
                    shipping = 2;
                }
                else if (subtotal <= 100) {
                    shipping = 5;
                }
                else {
                    shipping = 0.05 * subtotal; // 5% of subtotal
                }

                // Compute grand total
                total = subtotal + tax + shipping;

                return str;
            }
        } else {
            alert('Password incorrect!');
        }
    } else {
        alert(`${request.body.username} does not exist!`);
    }
});

// Response when /register is requested
app.get("/register", function (request, response) {
    var contents = fs.readFileSync('./views/register.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string
});

// Response when /process_register is requested
app.post("/process_register", function (request, response) {
    /* process a simple register form
    validate the reg info. if all data is valid, write to the user_data_filename */
    var err = [];

    // Name validation
    // Reg expressions found/modified from stackoverflow & w3resource
    if ((/^[a-zA-Z]+[ ]+[a-zA-Z]+$/).test(request.body.name) == false) {
        err.push('Enter a first and last name that contains letters only');
    }
    if (request.body.name.length > 30) {
        err.push('Name must be 30 characters or less');
    }

    // Username validation
    if (typeof users_reg_data[request.body.username] != 'undefined') {
        err.push('This username is already taken');
    }
    if (request.body.username.length < 4 || request.body.username.length > 10) {
        err.push('Username must be between 4-10 characters');
    }
    // Reg expressions found/modified from stackoverflow & w3resource
    if ((/^[0-9a-zA-Z]+$/).test(request.body.username) == false) {
        err.push('Username must contain letters and numbers only');
    }

    // Password validation
    if (request.body.password.length < 6) {
        err.push('Password needs a minimum of 6 characters');
    }
    if (request.body.password != request.body.repeat_password) {
        err.push('Passwords do not match');
    }

    // Email validation. Found and modified from stackoverflow & w3resource
    if ((/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(request.body.email) == false) {
        err.push('Email address is invalid');
    }

    // If all fields are validated, new user is created
    if (err.length == 0) {
        // Makes username case insensitive
        username = request.body.username.toLowerCase();;
        users_reg_data[username] = {};
        users_reg_data[username].name = request.body.name;
        users_reg_data[username].password = request.body.password;
        users_reg_data[username].email = request.body.email;
        // write updated object to user_data_filename
        reg_info_str = JSON.stringify(users_reg_data);
        fs.writeFileSync(user_data_filename, reg_info_str);
        // rediret to login page
        response.redirect('./login');
        alert('Success! You may now log in.');
    }
    if (err.length > 0) {
        alert(`**ERROR** ${err.join(' ')}`);
    }
});

// Serve static files from public folder
app.use(express.static('./public'));

// listens to connections on this port and console.log() enables us to see that it's listening
var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });