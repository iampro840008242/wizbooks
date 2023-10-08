$(document).ready(function () {
    // Smooth scrolling for navigation links
    $("nav a").on("click", function (event) {
        if (this.hash !== "") {
            event.preventDefault();

            var hash = this.hash;

            $("html, body").animate(
                {
                    scrollTop: $(hash).offset().top,
                },
                800, // Scroll duration in milliseconds
                function () {
                    window.location.hash = hash;
                }
            );
        }
    });

    // Advanced navigation styles
    $("nav li").hover(
        function () {
            // On hover
            $(this).find("a").addClass("active");
        },
        function () {
            // On mouse out
            $(this).find("a").removeClass("active");
        }
    );

    var cart = []; // Initialize an empty cart array

    // Function to update the cart display
    function updateCartDisplay() {
        var cartItems = $("#cart-items");
        cartItems.empty();

        var total = 0;

        cart.forEach(function (item, index) {
            var cartDiv = $("<div class='cart'></div>");
            var cartContentDiv = $("<div class='cart-content'></div>");
            var cartActionsDiv = $("<div class='cart-actions'></div>");

            cartContentDiv.append("<img src='wp.png' alt='" + item.title + "'>");
            cartContentDiv.append("<p class='cart-title'>" + item.title + "</p>");
            cartContentDiv.append("<p class='cart-price'>" + item.price + "</p>");

            var removeButton = $("<span class='remove-item'>Remove</span>");
            removeButton.data("index", index); // Store the index for later use
            removeButton.on("click", function () {
                // Remove the item from the cart array
                cart.splice(index, 1);
                // Update the cart display
                updateCartDisplay();

                // Find the corresponding "Add" button and change its text to "Add"
                var addButton = $(".add-to-cart[data-title='" + item.title + "']");
                addButton.removeClass("added-to-cart").addClass("add-to-cart").text("Add");

                // After 3 seconds, remove the "added" class
                setTimeout(function () {
                    addButton.removeClass("added");
                }, 3000);

                // Update the "Proceed to Pay with Razorpay" button visibility and style
                updatePayButton();
            });

            cartActionsDiv.append(removeButton);

            cartDiv.append(cartContentDiv);
            cartDiv.append(cartActionsDiv);

            cartItems.append(cartDiv);

            // Calculate the total price
            total += parseFloat(item.price);
        });

        // Display the total price
        cartItems.append("<div class='cart-total'>Total: " + total + " Rupees</div>");
    }

    // Event listener for the "Add to Cart" buttons
    $(".add-to-cart").on("click", function () {
        var title = $(this).data("title");
        var price = $(this).data("price");
        var isAdded = $(this).hasClass("added");

        if (!isAdded) {
            // Add the item to the cart
            cart.push({ title: title, price: price });

            // Update the cart display
            updateCartDisplay();

            // Change the button text to "Added"
            $(this).removeClass("add-to-cart").addClass("added-to-cart").text("Added");

            // Add the "added" class for styling
            $(this).addClass("added");

            // After 3 seconds, remove the "added" class and change the text back to "Add"
            var addButton = $(this);
            setTimeout(function () {
                addButton.removeClass("added").addClass("add-to-cart").text("Add");
            }, 3000);

            // Update the "Proceed to Pay with Razorpay" button visibility and style
            updatePayButton();
        }
    });

    // Event listener for the "Proceed to Pay with Razorpay" button
    $("#razorpay-payment-button").on("click", function () {
        // Calculate the total amount to be paid (in paise)
        var cartTotalPaise = calculateTotalPriceInPaise(); // Implement this function to calculate the total price

        // Prepare the payment options
        var options = {
            key: 'rzp_test_z0T8hOmvYAq5El', // Replace with your actual Razorpay Key ID
            amount: cartTotalPaise, // Total amount in paise
            currency: 'INR',
            name: 'WizBooks',
            description: 'Purchase from WizBooks',
            handler: function (response) {
                // Handle the payment success
                alert('Payment ID: ' + response.razorpay_payment_id);

                // Automatically download purchased books
                autoDownloadBooks(cart);

                // Redirect or perform other actions after successful payment
            },
            prefill: {
                name: 'John Doe', // Customer name
                email: 'john@example.com', // Customer email
                contact: '1234567890' // Customer phone number
            },
            theme: {
                color: '#ff5733' // Customize the color of the Razorpay button
            }
        };

        // Create a new Razorpay instance and open the payment dialog
        var rzp = new Razorpay(options);
        rzp.open();
    });

    // Function to calculate the total price in paise (customize this based on your cart)
    function calculateTotalPriceInPaise() {
        var cartItems = cart; // Replace 'cart' with your actual cart data
        var totalPaise = 0;

        for (var i = 0; i < cartItems.length; i++) {
            // Assuming your price format is like "1 Rupee"
            // Extract the numeric part and convert it to paise (1 Rupee = 100 paise)
            var priceParts = cartItems[i].price.split(" ");
            var rupees = parseFloat(priceParts[0]);
            var paise = rupees * 100;
            totalPaise += paise;
        }

        return totalPaise;
    }

    // Function to generate download links for purchased books
    function generateDownloadLinks(cart) {
        var downloadLinks = '';

        // Define your book titles and corresponding download links
        var books = [
            { title: "The Third Wheel", filename: "book1.pdf" },
            { title: "Old school", filename: "book2.pdf" },
            { title: "The last Straw", filename: "book3.pdf" },
            { title: "Big Shot", filename: "book4.pdf" },
            { title: "Hard Luck", filename: "book5.pdf" },
            { title: "Do-It-Yourself", filename: "book6.pdf" }
        ];

        cart.forEach(function (item) {
            // Find the purchased book in the 'books' array based on the title
            var purchasedBook = books.find(function (book) {
                return book.title.toLowerCase() === item.title.toLowerCase();
            });

            if (purchasedBook) {
                var bookFilename = purchasedBook.filename;
                var downloadLink = '<a href="' + bookFilename + '" download>Download ' + item.title + '</a><br>';
                downloadLinks += downloadLink;
            }
        });

        return downloadLinks;
    }

    // Function to automatically download purchased books
    function autoDownloadBooks(cart) {
        var downloadLinks = generateDownloadLinks(cart);

        // Display download links on the page
        $("#download-links").html(downloadLinks);

        // Trigger the download of purchased books
        $("a[download]").each(function () {
            var link = $(this).attr("href");
            var title = $(this).text();
            var anchor = document.createElement("a");
            anchor.href = link;
            anchor.download = title + ".pdf";
            anchor.click();
        });
    }


    // Function to update the visibility and style of the "Proceed to Pay with Razorpay" button
    function updatePayButton() {
        var payButton = $("#razorpay-payment-button");

        if (cart.length > 0) {
            // If items are in the cart, show and style the button
            payButton.show();
            payButton.addClass("attractive-button"); // Add a CSS class for styling
        } else {
            // If the cart is empty, hide the button
            payButton.hide();
        }
    }

    setTimeout(function () {
        $("#welcome").fadeOut(1000, function () {
            // Remove the welcome section from the DOM after fading out
            $(this).remove();
        });
    }, 2000); // 2000 milliseconds (2 seconds)

    // Initialize the button visibility and style
    updatePayButton();


    $("#mobile-nav-toggle").on("click", function () {
        $("nav ul").toggleClass("active");
    });
    
    // Hide the mobile navigation menu when a navigation link is clicked
    $("nav ul li a").on("click", function () {
        $("nav ul").removeClass("active");
    });
});
