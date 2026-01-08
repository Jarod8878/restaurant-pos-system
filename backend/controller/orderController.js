import axios from "axios";

export const placeOrder = async (phoneNumber, cart, setOrderId, setCart, discountCode = "", discountAmount = 0) => {
    if (!phoneNumber) {
        alert("User not logged in. Please log in to place an order.");
        return;
    }

    if (cart.length === 0) {
        alert("Order is unsuccessful, there are no items in the cart.");
        return;
    }

    const requestData = {
        phoneNumber,
        sales: cart.map(item => ({
            item_id: item.item_id,
            quantity: item.quantity,
            total_price: parseFloat(item.total_price),
            remarks: item.remarks || ''
        })),
        discountCode,
        discountAmount,
    };

    console.log("Request Data Sent to Backend:", requestData); 

    try {
        const response = await axios.post("http://localhost:3000/api/orderPoints", requestData);

        if (response.data.orderId) {
            setOrderId(response.data.orderId);
            alert(response.data.message || "Order placed successfully!");
            setCart([]); 
        } else {
            console.error("Order ID is missing from response");
        }
    } catch (err) {
        console.error("Error placing the order:", err);
        alert("Error placing the order, please try again.");
    }
};

