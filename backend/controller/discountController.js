import axios from 'axios';

export const fetchDiscounts = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/discounts');
        return response.data;
    } catch (error) {
        console.error("Error fetching discounts:", error);
        return [];
    }
};

export const redeemDiscount = async (customerId, discountId) => {
    try {
        const response = await axios.post('http://localhost:3000/api/discounts/redeem', {
            customerId,
            discountId
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to redeem discount");
    }
};

export const applyDiscount = async (customerId, discountCode) => {
    try {
        const response = await axios.post('http://localhost:3000/api/discounts/apply', {
            customerId,
            discountCode
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Failed to apply discount");
    }
};
