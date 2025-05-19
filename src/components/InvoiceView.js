import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/InvoiceView.css';

const InvoiceView = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/order/${orderId}`);
                setOrder(response.data);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Failed to load invoice data');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        try {
            const response = await axios.get(`/invoice/download/${orderId}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order.orderNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error downloading invoice:', err);
            alert('Failed to download invoice');
        }
    };

    if (loading) {
        return <div className="loading">Loading invoice...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!order) {
        return <div className="error">Order not found</div>;
    }

    return (
        <div className="invoice-view-container">
            <div className="invoice-actions no-print">
                <button onClick={handlePrint} className="print-btn">
                    🖨️ Print Invoice
                </button>
                <button onClick={handleDownload} className="download-btn">
                    📥 Download PDF
                </button>
            </div>

            <div className="invoice-document">
                <div className="invoice-header">
                    <div className="company-info">
                        <h1>SneakerNest</h1>
                        <p>123 Sneaker Street</p>
                        <p>Footwear City, FC 12345</p>
                        <p>Tel: (123) 456-7890</p>
                    </div>
                    <div className="invoice-info">
                        <h2>INVOICE</h2>
                        <p><strong>Invoice #:</strong> {order.orderNumber}</p>
                        <p><strong>Date:</strong> {formatDate(order.timeOrdered)}</p>
                        <p><strong>Status:</strong> {order.deliveryStatus}</p>
                    </div>
                </div>

                <div className="invoice-addresses">
                    <div className="billing-info">
                        <h3>Bill To:</h3>
                        <p><strong>{order.customerName || 'Customer'}</strong></p>
                        <p>{order.customerEmail || ''}</p>
                    </div>
                    <div className="shipping-info">
                        <h3>Ship To:</h3>
                        {order.deliveryAddress ? (
                            <>
                                <p><strong>{order.deliveryAddress.addressTitle}</strong></p>
                                <p>{order.deliveryAddress.streetAddress}</p>
                                <p>
                                    {order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.zipCode}
                                </p>
                                <p>{order.deliveryAddress.country}</p>
                            </>
                        ) : (
                            <p>No shipping address provided</p>
                        )}
                    </div>
                </div>

                <table className="invoice-items">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems?.map((item) => (
                            <tr key={item.productID}>
                                <td>{item.productName}</td>
                                <td>{item.quantity}</td>
                                <td>{formatCurrency(item.purchasePrice)}</td>
                                <td>{formatCurrency(item.quantity * item.purchasePrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                            <td><strong>{formatCurrency(order.totalPrice)}</strong></td>
                        </tr>
                    </tfoot>
                </table>

                <div className="invoice-footer">
                    <p>Thank you for your business!</p>
                    <p>Payment is due within 30 days.</p>
                    <p>
                        <strong>Delivery Tracking ID:</strong> {order.deliveryID}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceView;