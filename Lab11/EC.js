monthly_sales = [100, 250, 360];
tax_rate = 0.15;

function taxMultiply(monthly_sales) {
    tax_owing = monthly_sales * tax_rate;
    console.log([tax_owing]);
    }

monthly_sales.forEach(taxMultiply);