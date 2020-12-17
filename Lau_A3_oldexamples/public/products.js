jewelry_items = [
    {
        "name": "Cherry Earrings",
        "price": 30.00,
        "image": "./images/earrings.jpg"
    },
    {
        "name": "Cherry Ring",
        "price": 50.00,
        "image": "./images/ring.jpg"
    },
    {
        "name": "Cherry Bracelet",
        "price": 65.00,
        "image": "./images/bracelet.jpg"
    }
];
bag_items = [
    {
        "name": "Cherry Chain Bag",
        "price": 175.00,
        "image": "./images/bag1.jpg"
    },
    {
        "name": "Cherry Messenger Bag",
        "price": 225.00,
        "image": "./images/bag2.jpg"
    },
    {
        "name": "Cherry Travel Bag",
        "price": 270.00,
        "image": "./images/bag3.jpg"
    }
];
hat_items = [
    {
        "name": "Black Cherry Hat",
        "price": 22.00,
        "image": "./images/hat.jpg"
    },
    {
        "name": "Pink Cherry Hat",
        "price": 25.00,
        "image": "./images/hat2.jpg"
    },
    {
        "name": "Blue Cherry Hat",
        "price": 27.00,
        "image": "./images/hat3.jpg"
    }
];
sock_items = [
    {
        "name": "Pink Cherry Socks",
        "price": 20.00,
        "image": "./images/socks.jpg"
    },
    {
        "name": "White Cherry Socks",
        "price": 23.00,
        "image": "./images/socks2.jpg"
    },
    {
        "name": "Black Cherry Socks",
        "price": 25.00,
        "image": "./images/socks3.jpg"
    }
];

products = {
    "jewelry": jewelry_items,
    "bags": bag_items,
    "hats": hat_items,
    "socks": sock_items
}

if (typeof module != 'undefined') {
    module.exports.products = products;
}
