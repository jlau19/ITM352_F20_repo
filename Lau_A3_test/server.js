/* Coded by Jojo Lau, ITM 352, UH Manoa Fall 2020.
For e-Commerce Web-site Cherry On Top.
Special thanks to Professor Dan Port for the screencast helps and examples on this assignment!
All codes modified from previous labs and from screencast examples as noted in comments unless specified. */

// To access code from node packages
var express = require('express');
var myParser = require('body-parser');
var products_data = require('./public/products.json');
var fs = require('fs');
// Create an express app with reference to express
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');

// Variables to use later
var quantity_data;
const user_data_filename = 'user_data.json';

// Lab 13 Ex 3
// Parse body of requests with application/x-www-form-urlencoded content type
app.use(myParser.urlencoded({ extended: true }));

app.post("/get_products", function (request, response) {
    response.json(products_data);
});

// Lab 15 Ex 1 & 2, to use cookies and session
app.use(cookieParser());
app.use(session({ secret: "ITM352 rocks!" }));

// lab 14 Ex 2
// check if file exists before reading
if (fs.existsSync(user_data_filename)) {
    stats = fs.statSync(user_data_filename);

    var data = fs.readFileSync(user_data_filename, 'utf-8');
    users_reg_data = JSON.parse(data);
}

// Assignment 3 code Example 2 for server.js 
app.all('*', function (request, response, next) {
    // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
    if (typeof request.session.cart == 'undefined') {
        request.session.cart = {};

        for (pkey in products_data) {
            empty_array = new Array(products_data[pkey].length).fill(0);
            request.session.cart[pkey] = empty_array;
        }
        //console.log(request.session.cart);
    }
    next();
});

app.post("/add_to_cart", function (request, response, next) {
    console.log(request.body);

    //Validate update cart quantity.  If valid add to session.
    if (isNonNegInt(request.body.quantity) == true) {
        pkey = request.body.products_key;
        qty = Number.parseInt(request.body.quantity);
        index = Number.parseInt(request.body.product_index);
        request.session.cart[pkey][index] = qty;
        return_msg = { message: `${qty} added to cart!` };
    }
    else {
        return_msg = { message: "Please enter valid quantities!" };
    }
    console.log(request.session.cart);
    response.json(return_msg);
});


app.get("/cart", function (request, response) {
    console.log(request.session);
    var contents = fs.readFileSync('./views/cart.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    // Calls on this function to display invoice table (Assignment 1 MVC example)
    function display_cart_rows() {
        subtotal = 0;
        str = '';

        for (i = 0; i < request.session.cart.jewelry.length; i++) {

            if (request.session.cart.jewelry[i] > 0) {
                qty = request.session.cart.jewelry[i];

                // product row
                extended_price = qty * products_data[i].price
                subtotal += extended_price;
                str += (`
  <tr>
    <td align="center" width="43%">${products_data[i]['name']}</td>
    <td align="center" width="11%">${qty}</td>
    <td align="center" width="13%">\$${products_data[i]['price']}</td>
    <td align="center" width="54%">\$${extended_price}</td>
  </tr>
  `);
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
    }
});

app.get("/get_cart", function (request, response) {
    response.json(request.session.cart);
});

// Lab 13 Ex 3
// Response when /process_invoice is requested, when purchase form is submitted
app.post("/process_invoice", function (request, response) {
    let POST = request.body;
    console.log(POST);
    is_valid = true; // Starts out true, idea of using a variable is from Britnie Roach

    if (typeof POST['purchase_submit'] != 'undefined') {

        for (i = 0; i < products.length; i++) {
            var val = POST[`quantity${i}`];

            // Validates whether product selection form is empty
            if (POST.quantity0 == '' && POST.quantity1 == '' && POST.quantity2 == '' && POST.quantity3 == '' && POST.quantity4 == '' && POST.quantity5 == '' && POST.quantity6 == '' && POST.quantity7 == '') {
                is_valid = false;
            }

            // Validates whether quantities are non-negative integers and greater than 0
            if (isNonNegInt(val) && val > 0) {
                is_valid = true;
            }

            // Validates whether quantities are not non-negative integers
            if (isNonNegInt(val) == false) {
                is_valid = false;
            }
        }
        // If is_valid stays true after all validations, redirect to login
        if (is_valid == true) {
            quantity_data = POST;
            response.redirect('./login');
        } else {
            // If is_valid is false, redirect to error page
            var err_contents = fs.readFileSync('./views/errors/qtyerror.template', 'utf8');
            response.send(eval('`' + err_contents + '`')); // render template string
        }
    }
});

// Lab 14 Ex 3
// Response when /login is requested
app.get("/login", function (request, response) {
    // Lab 15 Ex 2 & 3
    if (typeof request.session.lastLogin != 'undefined') {
        lastLogin = request.session.lastLogin;
    } else {
        lastLogin = 'First login';
    }
    if (typeof request.cookies.username != 'undefined') {
        welcome_str = request.cookies.username;
    } else {
        welcome_str = 'Anonymous';
    }

    var contents = fs.readFileSync('./views/login.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string
});

// Lab 14 Ex 3, Professor Dan Port's in-class workshop help
// Response when process_login is requested from login
app.post("/process_login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not

    // Make username case insensitive
    user_name = request.body.username.toLowerCase();

    // if user exists
    if (typeof users_reg_data[user_name] != 'undefined' && typeof request.body != 'undefined') {

        // if the input password matches the one that's stored
        if (request.body.password == users_reg_data[user_name].password) {
            // Lab 15 Ex 2
            var now = new Date();
            request.session.lastLogin = now.getTime();
            console.log(`${request.body.username} logged in on ${request.session.lastLogin}`);
            response.cookie('username', request.body.username, { maxAge: 300 * 1000 });

            response.redirect('./products.html?products_key=jewelry');
            //var contents = fs.readFileSync('./views/cart.template', 'utf8');
            //response.send(eval('`' + contents + '`')); // render template string

        } else {
            // If passwords do not match, redirect to error page
            var err_contents = fs.readFileSync('./views/errors/pwerror.template', 'utf8');
            response.send(eval('`' + err_contents + '`')); // render template string 
        }
    } else {
        // If username does not exist, redirect to error page
        var err_contents = fs.readFileSync('./views/errors/usererror.template', 'utf8');
        response.send(eval('`' + err_contents + '`')); // render template string
    }
});

// Lab 14 Ex 4
// Response when /register is requested
app.get("/register", function (request, response) {
    var contents = fs.readFileSync('./views/register.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string
});

// Lab 14 Ex 4
// Response when /process_register is requested
app.post("/process_register", function (request, response) {
    /* process a simple register form
    validate the reg info. if all data is valid, write to the user_data_filename */
    var err = []; // Starts errors as empty

    /* The following are validations of name, username, password, and email.
    All expressions modified from https://www.w3resource.com/javascript/form/javascript-sample-registration-form-validation.php or stackoverflow */

    // Name validations
    if ((/^[a-zA-Z]+[ ]+[a-zA-Z]+$/).test(request.body.name) == false) {
        err.push('Enter a first and last name that contains letters only');
    }
    if (request.body.name.length > 30) {
        err.push('Name must be 30 characters or less');
    }

    // Username validations
    if (typeof users_reg_data[request.body.username] != 'undefined') {
        err.push('This username is already taken');
    }
    if (request.body.username.length < 4 || request.body.username.length > 10) {
        err.push('Username must be between 4-10 characters');
    }
    if ((/^[0-9a-zA-Z]+$/).test(request.body.username) == false) {
        err.push('Username must contain letters and numbers only');
    }

    // Password validations
    if (request.body.password.length < 6) {
        err.push('Password needs a minimum of 6 characters');
    }
    if (request.body.password != request.body.repeat_password) {
        err.push('Passwords do not match');
    }

    // Email validation
    // Modified from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
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
        response.redirect('./loginsuccess.html');
    } else {
        // Displays all errors in error page if there are any
        errs = err.join('! ');
        var contents = fs.readFileSync('./views/errors/regerror.template', 'utf8');
        response.send(eval('`' + contents + '`')); // render template string

    }
});

// Lab 11 Ex 4
// Function to check whether a quantity is a non-negative integer
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(q) != q) errors.push('Not a number!');// Check if string is a number value
    if (q == '') q = 0; // for empty textboxes
    if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
    return returnErrors ? errors : ((errors.length > 0) ? false : true);
};

// Serve static files from public folder
app.use(express.static('./public'));

// listens to connections on this port and console.log() enables us to see that it's listening
var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });