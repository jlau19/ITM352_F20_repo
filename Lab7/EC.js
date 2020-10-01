// Extra Credit

month = 1;


switch (month) {
    case 1:
        month = "January";
        num_days = 31;
        break;
    case 2:
        month = "February";
        num_days = 29;
        break;
    case 3:
        month = "March";
        num_days = 31;
        break;
    case 4:
        month = "April";
        num_days = 30;
        break;
    case 5:
        month = "May";
        num_days = 31;
        break;
    case 6:
        month = "June";
        num_days = 30;
        break;
    case 7:
        month = "July";
        num_days = 31;
        break;
    case 8:
        month = "August";
        num_days = 31;
        break;
    case 9:
        month = "September";
        num_days = 30;
        break;
    case 10:
        month = "October";
        num_days = 31;
        break;
    case 11:
        month = "November";
        num_days = 30;
        break;
    case 12:
        month = "December";
        num_days = 31;
        break;
    default:
        text = "Error: Invalid month"
}

if (month <= 12) {
    console.log(month + " has " + num_days + " days");
}
else {
    console.log(text);
}


