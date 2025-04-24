import React, { useState, useEffect } from "react";
import "../styles/ProductManager.css";

const ProductManager = () => {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    productId: "",
    quantity: "",
    status: "Ordered", // Default status
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);

  // Mock data for products and orders
  useEffect(() => {
    const initialOrders = [
      { 
        id: 1, 
        productId: 1,
        quantity: 2, 
        status: "Ordered", 
        comment: "Please deliver quickly",
        commentStatus: "Awaiting", // Default comment status
      },
      { 
        id: 2, 
        productId: 2, 
        quantity: 1, 
        status: "Shipped", 
        comment: "Can you pack it nicely?",
        commentStatus: "Awaiting", // Default comment status
      },
    ];

    setOrders(initialOrders);
    setTotalOrders(initialOrders.length);
  }, []);

  // Handle status change for each order
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: newStatus }
          : o
      )
    );
  };

  // Handle comment status change for each order
  const handleCommentStatusChange = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, commentStatus: newStatus }
          : o
      )
    );
  };

  // Handle new order submission
  const handleAddOrder = (e) => {
    e.preventDefault();
    const { productId, quantity, status } = newOrder;
    if (!productId || !quantity || !status) {
      alert("Please fill in all fields.");
      return;
    }
    const newId = orders.length ? orders[orders.length - 1].id + 1 : 1;
    const orderToAdd = {
      id: newId,
      productId: Number(productId),
      quantity: Number(quantity),
      status,
      comment: "", // No need for comment input for new orders
      commentStatus: "Awaiting", // Default comment status
    };
    setOrders([...orders, orderToAdd]);
    setNewOrder({ productId: "", quantity: "", status: "Ordered" });
    setTotalOrders(orders.length + 1);
  };

  // Filter orders based on search query (by comment)
  const filteredOrders = orders.filter(o =>
    o.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      <h1 className="h1">Product Manager</h1>

      {/* Dashboard Summary */}
      <div className="dashboard-summary">
        <p>Total Orders: {totalOrders}</p>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search orders by comment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Add Order Form */}
      <form onSubmit={handleAddOrder} className="order-form">
        <input
          type="text"
          name="productId"
          placeholder="Product ID"
          value={newOrder.productId}
          onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={newOrder.quantity}
          onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
        />
        <select
          name="status"
          value={newOrder.status}
          onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
        >
          <option value="Ordered">Ordered</option>
          <option value="Shipped">Shipped</option>
          <option value="Arrived">Arrived</option>
        </select>
        <button type="submit" className="add-btn">Add Order</button>
      </form>

      {/* Orders List */}
      <div className="order-list">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product ID</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Comment</th>
              <th>Comment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.productId}</td>
                <td>{o.quantity}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    <option value="Ordered">Ordered</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Arrived">Arrived</option>
                  </select>
                </td>
                <td>{o.comment}</td>
                <td>
                  <select
                    value={o.commentStatus}
                    onChange={(e) => handleCommentStatusChange(o.id, e.target.value)}
                  >
                    <option value="Awaiting">Awaiting</option>
                    <option value="Approved">Approved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager;
