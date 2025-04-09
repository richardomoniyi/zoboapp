import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentForm.css"; // Import custom CSS

import {
  PayPalScriptProvider,
  usePayPalCardFields,
  PayPalCardFieldsProvider,
  PayPalCardFieldsForm,
} from "@paypal/react-paypal-js";
interface Order {
  id: string;
  date: string;
  customer: {
    account: string;
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
  value: number;
}

interface BillingAddress {
  addressLine1: string;
  addressLine2: string;
  adminArea1: string;
  adminArea2: string;
  countryCode: string;
  postalCode: string;
}
const formatCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};
const api = import.meta.env.VITE_PAYAPI_URL;
const Paypal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook to navigate between routes
  const {
    orderId,
    amount,
    customerName,
    productName,
    biller,
    accountNumber,
    xamount,
    email,
  } = (location.state as {
    orderId?: string;
    amount?: number;
    customerName?: string;
    productName?: string;
    biller?: string;
    accountNumber?: string;
    accountName?: string;
    xamount?: number;
    email?: string;
  }) || { amount: 0, productName: "" };

  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [paid, setPaid] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    "enable-funding": "venmo",
    "buyer-country": "US",
    currency: "USD",
    components: "buttons,card-fields",
  };

  const [billingAddress] = useState<BillingAddress>({
    addressLine1: "",
    addressLine2: "",
    adminArea1: "",
    adminArea2: "",
    countryCode: "",
    postalCode: "",
  });

  const order: Order = {
    id: paymentId || "N/A",
    date: new Date().toLocaleDateString(),
    customer: {
      account: accountNumber || "N/A",
      name: customerName || "N/A",
      address: "Online",
      contact: email || "N/A",
    },
    items: [
      {
        name: biller + `/` + productName || "N/A",
        quantity: 1,
        price: amount || 0,
      },
    ],
    subtotal: amount || 0,
    tax: 0,
    total: amount || 0,
    value: xamount || 0,
  };

  async function createOrder(): Promise<string> {
    try {
      const response = await fetch(`${api}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart: [
            {
              id: productName || "", //.replace(" ", "_"),
              productName: productName || "", //.replace(" ", "_"),
              quantity: 1,
              price: amount,
            },
          ],
        }),
      });

      const orderData = await response.json();
      console.log("Order Data:", orderData);
      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        throw new Error(
          errorDetail
            ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
            : JSON.stringify(orderData)
        );
      }
    } catch (error) {
      console.error(error);
      return `Could not initiate PayPal Checkout...${error}`;
    }
  }

  async function onApprove(data: any): Promise<string> {
    try {
      const response = await fetch(`${api}/orders/${data.orderID}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const orderData = await response.json();
      console.log("Capture Order Data:", orderData);
      const transaction =
        orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
        orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
      const errorDetail = orderData?.details?.[0];

      if (errorDetail || !transaction || transaction.status === "DECLINED") {
        throw new Error(
          transaction
            ? `Transaction ${transaction.status}: ${transaction.id}`
            : errorDetail
            ? `${errorDetail.description} (${orderData.debug_id})`
            : JSON.stringify(orderData)
        );
      } else {
        setPaid(true);
        console.log(
          "Capture result",
          orderData,
          JSON.stringify(orderData, null, 2)
        );
        setPaymentId(transaction.id);
        return `Transaction ${transaction.status}: ${transaction.id}`;
      }
    } catch (error) {
      return `Sorry, your transaction could not be processed...${error}`;
    }
  }

  function onError(error: any): void {
    console.error("PayPal Error:", error);
  }

  return (
    <>
      <div className="background"></div>
      <div className="form-container">
        {/* Display Passed Parameters */}
        {!paid ? (
          <>
            <div className="payment-details">
            <p>
                <strong>Account:</strong> {accountNumber}
              </p>
              <p>
                <strong>Customer:</strong> {customerName}
              </p>
              <p>
                <strong>Biller:</strong> {biller}
              </p>
              <p>
                <strong>Product:</strong> {productName}
              </p>
              <p>
                <strong>Amount:</strong> ${amount?.toFixed(2)}
              </p>
            </div>
            <PayPalScriptProvider options={initialOptions}>
              <PayPalCardFieldsProvider
                createOrder={createOrder}
                onApprove={async (data) => setMessage(await onApprove(data))}
                onError={onError}
              >
                <PayPalCardFieldsForm />
                <SubmitPayment
                  isPaying={isPaying}
                  setIsPaying={setIsPaying}
                  billingAddress={billingAddress}
                />
               
                {/* Adds 10px spacing */}
                <p className="support">
                  {message && (
                    <p className="error">{<Message content={message} />}</p>
                  )}
                </p>
              </PayPalCardFieldsProvider>
            </PayPalScriptProvider>
          </>
        ) : (
          <>
            <div className="receipt-container">
              {/* Print Icon */}
              <div className="print-icon" onClick={() => window.print()}>
                <i className="fas fa-print"></i> {/* FontAwesome print icon */}
              </div>

              <div className="receipt-header">
                <p>Thank you for your purchase!</p>
              </div>

              <div className="receipt-section">
                <h2>Order Receipt</h2>
                <p>Order ID: {orderId}</p>
                <p>Date: {order.date}</p>
              </div>

              <div className="receipt-section">
                <h3>Customer Information:</h3>
                <p>Account: {order.customer.account}</p>
                <p>Name: {order.customer.name}</p>
                <p>Address: {order.customer.address}</p>
                <p>Contact: {order.customer.contact}</p>
              </div>

              <div className="receipt-section">
                <h3>Order Details:</h3>
                {order.items.map((item, index) => (
                  <div key={index} className="receipt-item">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>{formatCurrency(item.price,"USD","en-US")}</span>
                  </div>
                ))}
              </div>

              <div className="receipt-summary">
                <h3>Payment Summary:</h3>
                <div className="summary-item">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal,"USD","en-US")}</span>
                </div>
                <div className="summary-item">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax,"USD","en-US")}</span>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total,"USD","en-US")}</span>
                </div>
                <div className="summary-item total">
                  <span>Value:</span>
                  <span>{formatCurrency(order.value,"NGN","en-NG")}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <p>We appreciate your business!</p>
              </div>
            </div>
          </>
        )}
        {/* Cancel Button */}
        <div style={{ marginTop: "10px" }}></div> {/* Adds 10px spacing */}
        <button
          className="button-grey"
          onClick={() => navigate("/")} // Navigate back to PaymentForm
        >
          Close
        </button>
      </div>
    </>
  );
};

export default Paypal;

interface SubmitPaymentProps {
  isPaying: boolean;
  setIsPaying: (state: boolean) => void;
  billingAddress: BillingAddress;
}

const SubmitPayment: React.FC<SubmitPaymentProps> = ({
  isPaying,
  setIsPaying,
}) => {
  const { cardFieldsForm } = usePayPalCardFields();

  const handleClick = async () => {
    if (!cardFieldsForm) {
      throw new Error("No child components in <PayPalCardFieldsProvider />");
    }
    const formState = await cardFieldsForm.getState();
    if (!formState.isFormValid) {
      alert("The payment form is invalid");
      return;
    }
    setIsPaying(true);
    await cardFieldsForm.submit().finally(() => setIsPaying(false));
  };

  return (
    <button
      className={isPaying ? "btn" : "button btn-primary"}
      onClick={handleClick}
      disabled={isPaying}
    >
      {isPaying ? <div className="spinner tiny" /> : "Pay"}
    </button>
  );
};

interface MessageProps {
  content: string;
}

const Message: React.FC<MessageProps> = ({ content }) => <p>{content}</p>;
