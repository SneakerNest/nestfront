import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/RefundRequests.css';

const RefundRequests = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/refunds');
      setRefundRequests(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching refund requests:', err);
      setError('Failed to load refund requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (refundID) => {
    try {
      setLoading(true);
      const response = await axios.put(`/refunds/${refundID}/approve`);
      
      // Update the refund status in the local state
      setRefundRequests(prev => 
        prev.map(refund => 
          refund.refundID === refundID 
            ? { ...refund, status: 'Approved', responseDate: new Date().toISOString() }
            : refund
        )
      );
      
      setSuccessMessage(`Refund #${refundID} approved successfully. Product stock has been updated.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error approving refund:', err);
      setError('Failed to approve refund. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const openDeclineModal = (refund) => {
    setSelectedRefund(refund);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const handleDeclineRefund = async () => {
    if (!selectedRefund) return;
    
    try {
      setLoading(true);
      const response = await axios.put(`/refunds/${selectedRefund.refundID}/decline`, {
        declineReason: declineReason
      });
      
      // Update the refund status in the local state
      setRefundRequests(prev => 
        prev.map(refund => 
          refund.refundID === selectedRefund.refundID 
            ? { 
                ...refund, 
                status: 'Declined', 
                responseDate: new Date().toISOString(),
                declineReason: declineReason 
              }
            : refund
        )
      );
      
      setSuccessMessage(`Refund #${selectedRefund.refundID} has been declined.`);
      setShowDeclineModal(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error declining refund:', err);
      setError('Failed to decline refund. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredRefunds = filterStatus === 'all' 
    ? refundRequests 
    : refundRequests.filter(refund => 
        filterStatus === 'pending' 
          ? (refund.status || '').toLowerCase() === 'pending' 
          : (refund.status || '') === filterStatus
      );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  if (loading && refundRequests.length === 0) {
    return <div className="loading-container">Loading refund requests...</div>;
  }

  return (
    <div className="refund-requests-container">
      <div className="refund-header">
        <h2>Refund Requests</h2>
        <div className="filter-controls">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
          <button onClick={fetchRefundRequests} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>
      
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {filteredRefunds.length === 0 ? (
        <div className="no-refunds-message">
          No refund requests {filterStatus !== 'all' && `with status "${filterStatus}"`} found.
        </div>
      ) : (
        <div className="refunds-table-container">
          <table className="refunds-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((refund) => (
                <tr 
                  key={refund.refundID} 
                  className={`status-${refund.status.toLowerCase()}-row`}
                >
                  <td>#{refund.refundID}</td>
                  <td>#{refund.orderNumber}</td>
                  <td>{formatDate(refund.requestDate)}</td>
                  <td>
                    <div className="customer-info">
                      {refund.customerName}
                      <span className="customer-email">{refund.customerEmail}</span>
                    </div>
                  </td>
                  <td>{refund.productName}</td>
                  <td>{refund.quantity}</td>
                  <td className="amount-column">
                    {formatCurrency(refund.quantity * refund.purchasePrice)}
                  </td>
                  <td>
                    <div className="reason-text">
                      {refund.reason || 'No reason provided'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${refund.status.toLowerCase()}`}>
                      {refund.status}
                    </span>
                    {refund.status === 'Declined' && refund.declineReason && (
                      <div className="decline-reason">
                        {refund.declineReason}
                      </div>
                    )}
                  </td>
                  <td className="actions-column">
                    {refund.status && refund.status.toLowerCase() === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApproveRefund(refund.refundID)}
                          className="approve-btn"
                          title="Approve Refund"
                        >
                          ✓ Approve
                        </button>
                        <button 
                          onClick={() => openDeclineModal(refund)}
                          className="decline-btn"
                          title="Decline Refund"
                        >
                          ✗ Decline
                        </button>
                      </>
                    )}
                    {refund.status !== 'Pending' && (
                      <span className="processed-at">
                        Processed:<br />
                        {formatDate(refund.responseDate)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showDeclineModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Decline Refund Request</h3>
            <p>Please provide a reason for declining the refund request:</p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining the refund..."
              rows={4}
            />
            <div className="modal-actions">
              <button 
                onClick={handleDeclineRefund}
                className="confirm-btn"
              >
                Confirm Decline
              </button>
              <button 
                onClick={() => setShowDeclineModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundRequests;