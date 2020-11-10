const fs = require('fs');

const user_data_filename = 'user_data.json';

var data = fs.readFileSync(user_data_filename, 'utf-8');

users_reg_data = JSON.parse(data);

// console.log(users_reg_data, typeof users_reg_data);

console.log(users_reg_data['dport']['password']);