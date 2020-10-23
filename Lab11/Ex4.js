function isNonNegInt(val, returnErrors) {
    errors = []; // assume no errors at first
    if(Number(val) != val) errors.push('Not a number!'); // Check if string is a number value
    if(val < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(val) != val) errors.push('Not an integer!'); // Check that it is an integer
    return returnErrors ? errors : ((errors.length > 0) ? false : true);
}
        
        attributes = "Jojo;23;23.5;" + (0.5 - 23);
        pieces = attributes.split(";");
    
        for(i in pieces) {
            console.log(`${pieces[i]} is non neg int ${isNonNegInt(pieces[i],    true).join("***")}`);
        }
    