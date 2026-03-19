


// stores
let stores = [
    { id: 1, name: "Shoprite Ikeja" },
    { id: 2, name: "Spar Lekki" },
    { id: 3, name: "Justrite Yaba" },
    { id: 4, name: "Bokku Ilogbo" },
]

//  price per store
let products = {
    "6855123644549": { name: "Lacasera" },
    "6156000264042": { name: "Bottle water" },
    "333": { name: "Bread" },
    "444": { name: "Indomie" },
    "555": { name: "Sugar" }
};


let storeProducts = {
    1: {  //Shoprite
        "6855123644549": 500,
        "6156000264042": 150,
        "333": 800,
        "444": 300,
        "555": 1200
    },

    2: {  //Spar
        "6855123644549": 500,
        "6156000264042": 250,
        "333": 800,
        "444": 300,
        "555": 1200
    },

    3: {  //Justrite
        "6855123644549": 500,
        "6156000264042": 200,
        "333": 800,
        "444": 300,
        "555": 1200
    },

    4: {  //bokku
        "6855123644549": 500,
        "6156000264042": 350,
        "333": 800,
        "444": 300,
        "555": 1200
    },
};

// ----------end of database ---------



// load dropdown after page loads stores into dropdown
window.onload = function () {
    let select = document.getElementById("storeSelect");

    if (!select) return;
    stores.forEach(store => {
        let option = document.createElement("option");

        option.value = store.id;
        option.textContent = store.name;

        select.appendChild(option);
    });


};



let cart = {};
let total = 0;

let scanner;
let scanLocked = false;
let scanReady = true;
let lastScannedCode = null;





// select store
function selectStore() {

    let select = document.getElementById("storeSelect");

    let storeId = select.value;

    if (!storeId) {
        alert("Select store first");
        return;
    }

    let storeName = stores.find(s => s.id == storeId).name;

    //Save store
    localStorage.setItem("store_id", storeId);
    localStorage.setItem("store_name", storeName);


    document.getElementById("currentStore").innerText = "Current Store: " + storeName;





}














// starting scan
function startScanner() {

    scanner = new Html5Qrcode("reader");

    scanner.start(
        { facingMode: "environment" }, //back camera
        {
            fps: 10,
            qrbox: 250
        },






        (decodedText) => {

            // double scan
            if (scanLocked) return;

            scanLocked = true;



            // check store selected
            let storeId = localStorage.getItem("store_id");

            if (!storeId) {
                alert("Select store first");
                scanLocked = false;
                return;
            }




            // require barcode removed before next scan
            if (!scanReady && decodedText === lastScannedCode) {
                return;
            }

            scanReady = false;
            lastScannedCode = decodedText;


            // -----adding beep sound
            let beep = document.getElementById("beep");
            if (beep) beep.play();
            // -----end of beep sound



            // --------add to cart -----

            if (products[decodedText]) {

                let price = storeProducts[storeId]?.[decodedText];

                if (!price) {
                    alert(
                        "Product not in this Store"
                    );
                } else {
                    if (!cart[decodedText]) {
                        cart[decodedText] = {
                            name: products[decodedText].name,
                            price: price,
                            qty: 1
                        };
                    }

                    updateCart();
                }



            } else {
                alert("Unknown product");

            }

            // ---------- end of add to cart -----------






            //--------Show Result ------------

            let resultElement = document.getElementById("result");


            if (resultElement) {
                resultElement.innerText = "Result: " + decodedText;
            }

            // this is able to let Links scanned Clickable
            if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
                resultElement.innerHTML = 'Result: <a href=" ' + decodedText + '" target="_blank">' + decodedText + "</a>";

            } else {
                resultElement.innerText = "Result:" + decodedText;
            }
            // end of Scanned Links that ar clickable


            setTimeout(() => {
                scanLocked = false;
                scanReady = true;
            }, 4000); //this delay the scn by 4 secs


        },
        (error) => {
            console.log(error);

            // when camera sees nothing, allow next scan
            scanReady = true;
        }
    );

}


// updateCart or Show Cart list
function updateCart() {

    let cartList = document.getElementById("cart");
    cartList.innerHTML = "";


    total = 0;

    for (let code in cart) {
        let item = cart[code];

        let li = document.createElement("li");

        let itemTotal = item.price * item.qty;

        total += itemTotal;

        li.innerHTML = item.name + " | ₦" + item.price + " | Qty: " + item.qty +
            "<button onclick=\"addQty('" + code + "')\"> + </button>" +
            "<button onclick=\"minusQty('" + code + "')\"> - </button>" + " = ₦" + itemTotal;

        cartList.appendChild(li);

    }

    document.getElementById("total").innerText = "Total: ₦" + total;
}



// ---------add quantity button-----------
function addQty(code) {
    cart[code].qty++;

    updateCart();
}


// ----------minus quantity button ------------
function minusQty(code) {
    cart[code].qty--;

    if (cart[code].qty <= 0) {
        delete cart[code];
    }

    updateCart();

}


//------ Checkout Code -----------
function checkout() {
    // alert("Total = ₦" + total);

    // cart = {};
    // total = 0;


    // updateCart();


    if (Object.keys(cart).length === 0) {
        alert("Cart is empty");
        return;
    }

    let receiptDiv = document.getElementById("receipt");
    let storeName = localStorage.getItem("store_name");
    let receiptId = "RCPT-" + Date.now();

    let receiptHTML = "";

    receiptHTML += "<h3>Receipt</h3>";
    receiptHTML += "<p>ID: " + receiptId + "</p>";
    receiptHTML += "<p>Store: " + storeName + "</p>";
    receiptHTML += "<hr>";


    let totalAmount = 0;

    for (let code in cart) {
        let item = cart[code];

        let itemTotal = item.price * item.qty;

        totalAmount += itemTotal;

        receiptHTML +=
            item.name + " | ₦" + item.price + "x" + item.qty + " = ₦" + itemTotal + "<br>";

    }

    receiptHTML += "<hr>";
    receiptHTML += "<b>Total: ₦" + totalAmount + "</br>";

    receiptDiv.innerHTML = receiptHTML;


    // save receipt
    saveReceipt(receiptId, totalAmount);

    // gnerate QR Code
    generateQR(receiptId);
}






// generateQR Code receipt
function generateQR(receiptId){
    let qrDiv = document.getElementById("qrcode");
     
    qrDiv.innerHTML = "";

    let data = localStorage.getItem("last-receipt");

    new QRCode(qrDiv, {
        text: data,
        width: 200,
        height: 200
    });

}

// -----------------SAVE RECEIPT FUNCTION ------------
function saveReceipt(id, totalAmount) {

    let receiptData = {
        id: id,
        total: totalAmount,
        cart: cart,
        store: localStorage.getItem("store_id"),
        time: new Date().toLocaleString()
    };

    localStorage.setItem("last-receipt", JSON.stringify(receiptData));
    cart = {};
    updateCart();
}



// Stop scan
function stopScanner() {
    if (scanner) {
        scanner.stop().then(() => {
            console.log("Stopped");
        });
    }
}

