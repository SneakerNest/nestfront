import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/InvoiceList.css';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('current');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, [selectedMonth]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            
            // Calculate date range based on selected month
            const now = new Date();
            let startDate, endDate;
            
            if (selectedMonth === 'current') {
                // Current month
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            } else if (selectedMonth === 'previous') {
                // Previous month
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            } else if (selectedMonth === 'last30') {
                // Last 30 days
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
                endDate = now;
            }
            
            // Format dates for API
            const formatDate = (date) => {
                return date.toISOString().split('T')[0];
            };
            
            const response = await axios.post('/order/daterange', {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate)
            });
            
            setInvoices(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching invoices:', err);
            setError('Failed to load invoices data.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = async (orderId) => {
        try {
            window.open(`/invoice/${orderId}`, '_blank');
        } catch (err) {
            console.error('Error viewing invoice:', err);
        }
    };

    const handleDownloadInvoice = async (orderId, orderNumber) => {
        try {
            const response = await axios.get(`/invoice/download/${orderId}`, {
                responseType: 'blob'
            });
            
            // Create a download link and trigger it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setSuccessMessage('Invoice downloaded successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error downloading invoice:', err);
            setError('Failed to download invoice.');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleSendInvoice = async (orderId, email) => {
        if (!email) {
            setError('Customer email not available.');
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        try {
            await axios.get(`/invoice/mail/${orderId}/${email}`);
            setSuccessMessage('Invoice sent successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error sending invoice:', err);
            setError('Failed to send invoice.');
            setTimeout(() => setError(null), 3000);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return <div className="loading-spinner">Loading invoices...</div>;
    }

    return (
        <div className="invoice-list-container">
            <div className="header-actions">
                <h2>Monthly Invoices</h2>
                <div className="filter-controls">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="month-selector"
                    >
                        <option value="current">Current Month</option>
                        <option value="previous">Previous Month</option>
                        <option value="last30">Last 30 Days</option>
                    </select>
                    <button onClick={fetchInvoices} className="refresh-button">
                        🔄 Refresh
                    </button>
                </div>
            </div>
            
            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}
            
            {invoices.length === 0 ? (
                <div className="no-invoices-message">
                    No invoices found for the selected period.
                </div>
            ) : (
                <div className="invoices-table-container">
                    <table className="invoices-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((order) => (
                                <tr key={order.orderID} className={`status-${order.deliveryStatus?.toLowerCase()}-row`}>
                                    <td>{order.orderNumber}</td>
                                    <td>{formatDate(order.timeOrdered)}</td>
                                    <td>
                                        {order.customerName || 'Unknown'}
                                        {order.customerEmail && <div className="customer-email">{order.customerEmail}</div>}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${order.deliveryStatus?.toLowerCase()}`}>
                                            {order.deliveryStatus}
                                        </span>
                                    </td>
                                    <td className="price-column">{formatCurrency(order.totalPrice)}</td>
                                    <td className="actions-column">
                                        <button 
                                            onClick={() => handleViewInvoice(order.orderID)}
                                            className="view-btn"
                                            title="View Invoice"
                                        >
                                            👁️
                                        </button>
                                        <button 
                                            onClick={() => handleDownloadInvoice(order.orderID, order.orderNumber)}
                                            className="download-btn"
                                            title="Download Invoice"
                                        >
                                            📥
                                        </button>
                                        {order.customerEmail && (
                                            <button 
                                                onClick={() => handleSendInvoice(order.orderID, order.customerEmail)}
                                                className="email-btn"
                                                title="Email Invoice"
                                            >
                                                📧
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;