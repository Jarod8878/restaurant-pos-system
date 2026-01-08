import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import routes from './routes/routes';
import './App.css';

const App = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [cart, setCart] = useState([]);
    const [customerId, setCustomerId] = useState(() => localStorage.getItem("customerId") || "");

    useEffect(() => {
        console.log("customerId in App:", customerId);
      }, [customerId]);

    useEffect(() => {
        axios.get('http://localhost:3000/api/items')
            .then((response) => {
                const transformedData = response.data.map((item) => ({
                    ...item,
                    price: parseFloat(item.price) || 0,
                }));
                setMenuItems(transformedData);

                const initialQuantities = {};
                transformedData.forEach(item => {
                    initialQuantities[item.item_id] = 0;
                });
                setQuantities(initialQuantities);
            })
            .catch((error) => {
                console.error('Error fetching menu items:', error);
            });
    }, []);
    
    return (
            <Router>
                <Routes>
                    {routes.map((route, index) => {
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={React.isValidElement(route.element)
                                    ? React.cloneElement(route.element, {
                                        customerId, setCustomerId,
                                        cart, setCart,
                                        quantities, setQuantities,
                                        menuItems
                                    })
                                    : route.element
                                }
                            >
                                {route.children?.map((child, childIndex) => {
                                    return (
                                        <Route
                                            key={childIndex}
                                            path={child.path}
                                            element={React.isValidElement(child.element)
                                                ? React.cloneElement(child.element, {
                                                    customerId, setCustomerId,
                                                    cart, setCart,
                                                    quantities, setQuantities,
                                                    menuItems
                                                })
                                                : child.element
                                            }
                                        />
                                    );
                                })}
                            </Route>
                        );
                    })}
                </Routes>
            </Router>
    );
};

export default App;
