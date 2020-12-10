var express = require('express');
var app = express();
var myParser = require("body-parser");
const fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser());
app.use(session({secret: "ITM352 rocks!"}));

const user_data_filename = 'user_data.json';

// check if file exists before reading
if (fs.existsSync(user_data_filename)) {
    stats = fs.statSync(user_data_filename);

    var data = fs.readFileSync(user_data_filename, 'utf-8');
    users_reg_data = JSON.parse(data);
}

app.use(myParser.urlencoded({ extended: true }));

app.get('/use_session', function (request, response) {
    if(typeof request.session.id != 'undefined') {
        response.send(`welcome, your session ID is ${request.session.id}`)
    }
    request.session.destroy();
});

app.get('/set_cookie', function (request, response) {
    response.cookie('myname', 'Jojo', {maxAge: 5*1000});
    response.send('cookie sent!');
});

app.get('/use_cookie', function (request, response) {
    console.log(request.cookies);
    thename = 'ANONYMOUS';
    if(typeof request.cookies["myname"] != 'undefined') {
        thename = request.cookies['myname'];
    }
    response.send(`Welcome to the Use Cookie page ${thename}`);
});

app.get("/login", function (request, response) {
    // Give a simple login form
    console.log(request.session);
    if(typeof request.session.lastLogin != 'undefined') {
        lastLogin = request.session.lastLogin;
    } else {
        lastLogin = 'First login!';
    }
    if(typeof request.cookies.username != 'undefined') {
        welcome_str = request.cookies.username;
    } else {
        welcome_str = 'IDK';
    }
    str = `
<body>
Welcome back ${welcome_str}<br>
Last Login: ${lastLogin}
<form action="process_login" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
});

app.post("/process_login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    console.log(`${request.body.username} logged in on ${request.session.lastLogin}`);
    // if user exists, get their password
    if (typeof users_reg_data[request.body.username] != 'undefined') {
        if (request.body.password == users_reg_data[request.body.username].password) {
            var now = new Date();
            request.session.lastLogin = now.getTime();
            console.log(`${request.body.username} logged in on ${request.session.lastLogin}`);
            response.cookie('username', request.body.username, {maxAge: 60*1000});
            response.send(`Thank you ${request.body.username} for logging in.`);
        } else {
            response.send(`Hey! ${request.body.password} does not match what we have for you!`);
        }
    } else {
        response.send(`Hey! ${request.body.username} does not exist!`);
    }
});

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
});

app.post("/process_register", function (request, response) {
    /* process a simple register form
    validate the reg info. if all data is valid, write to the user_data_filename */
    if (typeof users_reg_data[username] == 'undefined' && users_reg_data[username].password == POSTusers_reg_data[username].repeat_password) {
        username = request.body.username;
        users_reg_data[username] = {};
        users_reg_data[username].password = request.body.password;
        users_reg_data[username].email = request.body.email;
        // write updated object to user_data_filename
        reg_info_str = JSON.stringify(users_reg_data);
        fs.writeFileSync(user_data_filename, reg_info_str);
    }   
});

app.listen(8080, () => console.log(`listening on port 8080`));
