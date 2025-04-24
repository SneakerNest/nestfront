import React, { useState, useEffect } from "react";
import "../styles/ProductManager.css";
import products from "../data/products";

const ProductManager = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    image: ""
  });
  const rawStock = [
    { id: 1, stock: 14 },
    { id: 2, stock: 10 },
    { id: 3, stock: 20 },
    { id: 4, stock: 8 },
    { id: 5, stock: 14 },
    { id: 6, stock: 14 },
    { id: 7, stock: 10 },
    { id: 8, stock: 20 },
    { id: 9, stock: 8 },
    { id: 10, stock: 14 },
    { id: 11, stock: 14 },
    { id: 12, stock: 10 },
    { id: 13, stock: 20 },
    { id: 14, stock: 8 },
    { id: 15, stock: 14 }
  ];

  useEffect(() => {
    const mockOrders = [
      {
        orderID: 1,
        orderNumber: 1001,
        totalPrice: "234.97",
        deliveryStatus: "Delivered",
        orderItems: [
          {
            orderID: 1,
            productID: 1,
            productName: "Converse Black",
            quantity: 1,
            purchasePrice: "85.49",
            comment: "Fast delivery.",
            commentStatus: "Awaiting"
          },
          {
            orderID: 1,
            productID: 2,
            productName: "Dunk Blue",
            quantity: 1,
            purchasePrice: "116.99",
            comment: "Great colors.",
            commentStatus: "Awaiting"
          }
        ]
      },
      {
        orderID: 2,
        orderNumber: 1002,
        totalPrice: "152.75",
        deliveryStatus: "In Transit",
        orderItems: [
          {
            orderID: 2,
            productID: 3,
            productName: "Nike Air Max",
            quantity: 2,
            purchasePrice: "59.99",
            comment: "Most comfortable shoe I own.",
            commentStatus: "Awaiting"
          },
          {
            orderID: 2,
            productID: 4,
            productName: "Samba Grey",
            quantity: 1,
            purchasePrice: "32.77"
          }
        ]
      },
      {
        orderID: 3,
        orderNumber: 1003,
        totalPrice: "89.00",
        deliveryStatus: "Processing",
        orderItems: [
          {
            orderID: 3,
            productID: 5,
            productName: "Air Jordan 1",
            quantity: 1,
            purchasePrice: "89.00",
            comment: "No one at uni can match my drip when I have these on my feet.",
            commentStatus: "Approved"
          }
        ]
      }
    ];
  
    setOrders(mockOrders);

    const merged = products.map(prod => {
      const stockInfo = rawStock.find(s => s.id === prod.id);
      return {
        ...prod,
        stock: stockInfo?.stock ?? 0
      };
    });
    setStock(merged);
    
  }, []);
  

  const handleDeliveryStatusChange = (orderID, newStatus) => {
    setOrders(prev =>
      prev.map(o =>
        o.orderID === orderID ? { ...o, deliveryStatus: newStatus } : o
      )
    );
  };

  const handleCommentStatusChange = (orderID, productID, newStatus) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.orderID !== orderID) return o;
        return {
          ...o,
          orderItems: o.orderItems.map(item =>
            item.id === productID
              ? { ...item, commentStatus: newStatus }
              : item
          )
        };
      })
    );
  };

  const allCommentItems = orders
    .flatMap(order =>
      order.orderItems
        .filter(item => item.comment)
        .map(item => ({
          ...item,
          orderNumber: order.orderNumber,
          orderID: order.orderID
        }))
    );
    
    const handleStockInput = (productID, value) => {
      const parsed = parseInt(value);
      if (!isNaN(parsed) && parsed >= 0) {
        setStock(prev =>
          prev.map(item =>
            item.id === productID ? { ...item, stock: parsed } : item
          )
        );
      }
    };
    
  return (
    <div className="container">
      <h1 className="h1">Product Manager</h1>

      <div className="tab-buttons">
        <button onClick={() => setActiveTab("stock")}>Stock Manager</button>
        <button onClick={() => setActiveTab("orderStatus")}>Order Status</button>
        <button onClick={() => setActiveTab("comments")}>Comment Approval</button>
      </div>

      {activeTab === "stock" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button
            onClick={() => setShowAddForm(true)}
            className="add-product-btn"
          >
            + Add Product
          </button>
          {showAddForm && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Add New Product</h3>
                <input
                  type="text"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />

                <div className="modal-actions">
                  <button
                    onClick={() => {
                      const { name, category, stock: stockAmount, image } = formData;
                      if (!name || !category || isNaN(parseInt(stock))) {
                        alert("Please fill in all fields correctly.");
                        return;
                      }

                      const newId = stock.length
                        ? Math.max(...stock.map(p => p.id)) + 1
                        : 1;

                      const newProduct = {
                        id: newId,
                        name,
                        category,
                        stock: parseInt(stockAmount),
                        image
                      };

                      setStock(prev => [...prev, newProduct]);
                      setShowAddForm(false);
                      setFormData({ name: "", category: "", stock: "", image: "" });
                    }}
                  >
                    Add
                  </button>
                  <button onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          <table className="stock-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {stock.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) =>
                        handleStockInput(product.id, e.target.value)
                      }
                      className="stock-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "orderStatus" && (
        <div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Number</th>
                <th>Total Price</th>
                <th>Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.orderID}>
                  <td>{o.orderID}</td>
                  <td>{o.orderNumber}</td>
                  <td>${o.totalPrice}</td>
                  <td>
                    <select
                      value={o.deliveryStatus}
                      onChange={(e) =>
                        handleDeliveryStatusChange(o.orderID, e.target.value)
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "comments" && (
        <div>
          {allCommentItems.length === 0 ? (
            <p style={{ marginTop: "15px" }}><i>No comments found.</i></p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Number</th>
                  <th>Product Name</th>
                  <th>Comment</th>
                  <th>Comment Status</th>
                </tr>
              </thead>
              <tbody>
                {allCommentItems.map(item => (
                  <tr key={`${item.orderID}-${item.id}`}>
                    <td>{item.orderID}</td>
                    <td>{item.orderNumber}</td>
                    <td>{item.productName}</td>
                    <td>{item.comment}</td>
                    <td>
                      <select
                        value={item.commentStatus || "Awaiting"}
                        onChange={(e) =>
                          handleCommentStatusChange(
                            item.orderID,
                            item.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Awaiting">Awaiting</option>
                        <option value="Approved">Approved</option>
                        <option value="Disapproved">Disapproved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductManager;
