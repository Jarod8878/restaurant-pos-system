export const fetchMenuItems = async (setMenuItems, setQuantities) => {
    try {
        const response = await fetch('http://localhost:3000/api/items');
        if (!response.ok) throw new Error("Failed to fetch menu items");

        const data = await response.json();
        const formattedItems = data.map((item) => ({
            ...item,
            price: parseFloat(item.price) || 0, 
        }));

        setMenuItems(formattedItems);

        const initialQuantities = {};
        formattedItems.forEach((item) => {
            initialQuantities[item.item_id] = 0;
        });
        setQuantities(initialQuantities);
    } catch (error) {
        console.error("Error fetching menu items:", error);
    }
};

export const incrementQuantity = (itemId, setQuantities) => {
    setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [itemId]: (prevQuantities[itemId] || 0) + 1,
    }));
};

export const decrementQuantity = (itemId, setQuantities) => {
    setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [itemId]: Math.max((prevQuantities[itemId] || 0) - 1, 0),
    }));
};

export const handleCheckout = (menuItems, quantities, setCart, navigate) => {
    const selectedItems = menuItems
        .filter((item) => (quantities[item.item_id] || 0) > 0)
        .map((item) => ({
            item_id: item.item_id,
            name: item.name,
            quantity: quantities[item.item_id],
            price: item.price,
            total_price: quantities[item.item_id] * item.price,
        }));

    setCart(selectedItems);
    navigate('/cart', { state: { cart: selectedItems } });
};


