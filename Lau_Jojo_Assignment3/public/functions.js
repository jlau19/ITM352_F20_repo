/* Coded by Jojo Lau, ITM 352, UH Manoa Fall 2020.
For e-Commerce Web-site Cherry On Top.
This page stores working functions for the application, from Professor Port's working examples during his Assignment 3 workshop class. */

// Professor Port's Assignment 3 example codes: Example 1
// This function asks the server for a "service" and converts the response to text. 
function loadJSON(service, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('POST', service, false);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

// Professor Port's Assignment 3 example codes: Example 1
// This function makes a navigation bar from a products_data object
function nav_bar(this_product_key, products_data) {
  // This makes a navigation bar to other product pages
  for (products_key in products_data) {
    if (products_key == this_product_key) continue;
    document.write(`<a href='./products.html?products_key=${products_key}'>${products_key}<a>&nbsp&nbsp&nbsp;`);
  }
}

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

// Lab 12 Ex 1
// Function that checks quantities a user enters and displays errors
function checkQuantityTextbox(theTextbox) {
  errs = isNonNegInt(theTextbox.value, true);
  if (errs.length == 0) errs = ['You want:'];
  if (theTextbox.value.trim() == '') errs = ['Quantity'];
  document.getElementById(theTextbox.name + '_label').innerHTML = errs.join(" ");
};

// Professor Port's Assignment 3 example from A3 workshop class
// Used in products.html to see if user is logged in
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
