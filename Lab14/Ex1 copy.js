var express = require('express');
var app = express();
var myParser = require("body-parser");
const fs = require('fs');

const user_data_filename = 'user_data.json';

// check if file exists before reading
if (fs.existsSync(user_data_filename)) {
    stats = fs.statSync(user_data_filename);
    console.log(`user_daa.json has ${stats['size']} characters`);
    
    var data = fs.readFileSync(user_data_filename, 'utf-8');
}

users_reg_data = JSON.parse(data);

app.use(myParser.urlencoded({ extended: true }));

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not

});

//have login.html as static and be in public directory
app.use()

app.listen(8080, () => console.log(`listening on port 8080`));
