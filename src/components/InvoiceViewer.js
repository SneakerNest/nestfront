import React, { useState, useEffect } from 'react';

const InvoiceViewer = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    // Mock data — replace with real API or file fetch
    setInvoices([
      { id: 1, name: 'Invoice #001', url: '/invoices/invoice1.pdf' },
      { id: 2, name: 'Invoice #002', url: '/invoices/invoice2.pdf' },
    ]);
  }, []);

  return (
    <div>
      <h2>Invoices</h2>
      <ul>
        {invoices.map((inv) => (
          <li key={inv.id}>
            <a href={inv.url} target="_blank" rel="noopener noreferrer">
              {inv.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvoiceViewer;
