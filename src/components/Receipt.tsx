import React from 'react';
import './Receipt.css';

interface Order {
  id: string;
  date: string;
  customer: {
    name: string;
    address: string;
    contact: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
}

const OrderReceipt: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <h1>Company Name</h1>
        <p>Thank you for your purchase!</p>
      </div>

      <div className="receipt-section">
        <h2>Order Receipt</h2>
        <p>Order ID: {order.id}</p>
        <p>Date: {order.date}</p>
      </div>

      <div className="receipt-section">
        <h3>Customer Information:</h3>
        <p>{order.customer.name}</p>
        <p>{order.customer.address}</p>
        <p>{order.customer.contact}</p>
      </div>

      <div className="receipt-section">
        <h3>Order Details:</h3>
        {order.items.map((item, index) => (
          <div key={index} className="receipt-item">
            <span>{item.name} x{item.quantity}</span>
            <span>₦{item.price}</span>
          </div>
        ))}
      </div>

      <div className="receipt-summary">
        <h3>Payment Summary:</h3>
        <div className="summary-item">
          <span>Subtotal:</span>
          <span>₦{order.subtotal}</span>
        </div>
        <div className="summary-item">
          <span>Tax:</span>
          <span>₦{order.tax}</span>
        </div>
        <div className="summary-item total">
          <span>Total:</span>
          <span>₦{order.total}</span>
        </div>
      </div>

      <div className="receipt-footer">
        <p>We appreciate your business!</p>
      </div>
    </div>
  );
};

export default OrderReceipt;
