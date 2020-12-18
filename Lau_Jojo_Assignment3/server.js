/* Coded by Jojo Lau, ITM 352, UH Manoa Fall 2020.
For e-Commerce Web-site Cherry On Top.
Special thanks to Professor Dan Port for the workshop helps and examples on this assignment!
All codes modified from previous labs/WODs and from screencast/Assignment examples as noted in comments unless specified. */

// To access code from node packages
var express = require('express');
var myParser = require('body-parser');
var products_data = require('./public/products.json');
var fs = require('fs');
// Create an express app with reference to express
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var nodemailer = require('nodemailer');

const user_data_filename = 'user_data.json';

// Lab 13 Ex 3
// Parse body of requests with application/x-www-form-urlencoded content type
app.use(myParser.urlencoded({ extended: true }));

// Lab 15 Ex 1 & 2, to use cookies and session
app.use(cookieParser());
app.use(session({ secret: "ITM352 rocks!" }));

// Assignment 3 example code, Ex 1
app.post("/get_products", function (request, response) {
    response.json(products_data);
});

// Assignment 3 example code, Ex 1
app.post("/get_cart", function (request, response) {
    response.json(request.session.cart);
});

// lab 14 Ex 2
// check if file exists before reading
if (fs.existsSync(user_data_filename)) {
    stats = fs.statSync(user_data_filename);
    var data = fs.readFileSync(user_data_filename, 'utf-8');
    var users_reg_data = JSON.parse(data);
}

// Assignment 3 code Example 2 for server.js 
app.all('*', function (request, response, next) {
    // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
    if (typeof request.session.cart == 'undefined') {
        request.session.cart = {};
        console.log('empty cart created');
    }
    next();
});

// Assignment 3 example code, Ex 2
// Response when user clicks add to cart in products page, invokes this action for quantity validation and storing quantities in session
app.get("/add_to_cart", function (request, response, next) {
    var products_key = request.query['products_key']; // get the product key sent from the form post
    var quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers

    for (i = 0; i < quantities.length; i++) {
        is_valid = true; //starts out true, idea to use variable from Britnie Roach

        // Validates whether product selection form is empty
        if (quantities[0] == 0 && quantities[1] == 0 && quantities[2] == 0) {
            is_valid = false;
        }

        // Validates whether quantities are non-negative integers
        if (isNonNegInt(quantities[0]) == false || isNonNegInt(quantities[1]) == false || isNonNegInt(quantities[2]) == false) {
            is_valid = false;
        }
    }

    if (is_valid == true) {
        request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key when quantity is valid
        request.session.save(); // from A3 workshop help
        console.log(request.session.cart);
        var added_to_cart = fs.readFileSync('./views/added_to_cart.template', 'utf8');
        response.send(eval('`' + added_to_cart + '`')); // render template string
    } else {
        var err_contents = fs.readFileSync('./views/errors/qtyerror.template', 'utf8');
        response.send(eval('`' + err_contents + '`')); // render template string
    }
});

// Modified from my Assignment 2 and Invoice 4, A3 example code Ex 2
// Response when user clicks cart
app.get("/cart", function (request, response) {
    // If user is logged in, their username will be displayed in cart_str message
    if (typeof request.cookies.username != 'undefined') {
        user_name = request.cookies.username;
        cart_str = `Hi ${user_name}, please review your shopping cart before purchasing!`;
        // If user is not logged in, they will be referred to as Anonymous
    } else {
        user_name = 'Anonymous';
        cart_str = `Hi ${user_name}, please review your shopping cart!`
    }

    subtotal = 0;
    invoice_rows = '';

    // Loop for each product key in session cart array, from Professor Port's A3 workshop
    for (pk in request.session.cart) {

        // Loop for each specific item in the product key of session cart array
        for (i = 0; i < request.session.cart[pk].length; i++) {
            qty = request.session.cart[pk][i];

            // Displays quantites only if they are greater than 0
            if (qty > 0) {
                // product row
                extended_price = qty * products_data[pk][i].price
                subtotal += extended_price;
                invoice_rows += (`
  <tr>
    <td align="center" width="43%">${products_data[pk][i]['name']}</td>
    <td align="center" width="11%">${qty}</td>
    <td align="center" width="13%">\$${products_data[pk][i]['price']}</td>
    <td align="center" width="54%">\$${extended_price}</td>
  </tr>
  `);
            }
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

    var contents = fs.readFileSync('./views/cart.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string
});

// Response for when user wants to clear cart data
app.get("/remove_items", function (request, response) {
    for (pk in request.session.cart) {

        // For each specific item in the product key of session cart array
        for (i in request.session.cart[pk]) {
            request.session.cart[pk][i] = 0; // makes all quantites in cart 0
        }
    }
    request.session.save();
    console.log(request.session.cart);
    response.redirect('./removeitems.html');
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
            // Set cookie to expire after 15 minutes
            response.cookie('username', request.body.username, { maxAge: 900 * 1000 });

            response.redirect('./loginsuccess.html');

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

// Modified from Assignment 3 code examples: Example 3, my A2 and Invoice 4
// Response when /checkout is requested at shopping cart page, loads invoice and emails user
app.post("/checkout", function (request, response) {
    if (typeof request.cookies.username != 'undefined') {
        user_name = request.cookies.username;

        subtotal = 0;
        invoice_rows = '';

        // For each product key in session cart array
        for (pk in request.session.cart) {

            // For each specific item in the product key of session cart array
            for (i = 0; i < request.session.cart[pk].length; i++) {
                qty = request.session.cart[pk][i];

                if (qty > 0) {
                    // product row
                    extended_price = qty * products_data[pk][i].price
                    subtotal += extended_price;
                    invoice_rows += (`
                    <tr>
                    <td align="center" width="43%">${products_data[pk][i]['name']}</td>
                    <td align="center" width="11%">${qty}</td>
                    <td align="center" width="13%">\$${products_data[pk][i]['price']}</td>
                    <td align="center" width="54%">\$${extended_price}</td>
                    </tr>
                    `);
                }
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

        // Set up mail server. Only will work on UH Network due to security restrictions
        var transporter = nodemailer.createTransport({
            host: "mail.hawaii.edu",
            port: 25,
            secure: false, // use TLS
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            }
        });

        var user_email = users_reg_data[user_name].email; // grab user email data
        // Sends invoice to user's email from my unimportant email address
        var mailOptions = {
            from: 'jlaaau@gmail.com',
            to: user_email,
            subject: 'Your Invoice from Cherry On Top',
            html: `<p>Thank you ${user_name} for shopping at Cherry on top!</p>
            <p>Please review your invoice below:</p>
            <table border="2">
            <tbody>
              <tr>
                <th style="text-align: center;" width="43%">Item</th>
                <th style="text-align: center;" width="11%">Quantity</th>
                <th style="text-align: center;" width="13%">Price</th>
                <th style="text-align: center;" width="54%">Extended price</th>
              </tr>
                ${invoice_rows}
              <tr>
                <td style="text-align: center;" colspan="4" width="100%">&nbsp;</td>
              </tr>
              <tr>
                <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
                <td style="text-align: center;" width="54%">$
                  ${subtotal}
                </td>
              </tr>
              <tr>
                <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @
                    ${(100 * tax_rate)}%</span></td>
                <td style="text-align: center;" width="54%">\$${tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="text-align: center;" colspan="3" width="67%">Shipping</span></td>
                <td style="text-align: center;" width="54%">\$${shipping.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
                <td style="text-align: center;" width="54%"><strong>\$${total.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>` //content of email, invoice table
        };

        // Displays email_str message for when emailing user is successful or not
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                email_str = `There was an error and your invoice could not be emailed to ${user_email} :(`;
                console.log(error);
            } else {
                email_str = `Your invoice was mailed to ${user_email}! :)`;
            }

            // Directs to checkout page
            var contents = fs.readFileSync('./views/checkout.template', 'utf8');
            response.send(eval('`' + contents + '`')); // render template string

        });
    } else {
        response.redirect('./login');
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
        response.redirect('./registersuccess.html');
    } else {
        // Displays all errors in error page if there are any
        errs = err.join('! ');
        var contents = fs.readFileSync('./views/errors/regerror.template', 'utf8');
        response.send(eval('`' + contents + '`')); // render template string

    }
});

// Lab 15 Ex 4
// Response when user wants to log out, destroys session and clears cookie
app.get("/logout", function (request, response) {
    response.clearCookie("username");
    request.session.destroy();
    response.redirect('./logoutsuccess.html');
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