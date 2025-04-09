import { FormEvent, useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import "./PaymentForm.css"; // Import custom CSS
import "./Receipt.css";
import Select from "react-select";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { CheckCircle } from "lucide-react";
import Chatbot from "./Chatbot";

const PaymentForm = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State to manage chatbot visibility
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen); // Toggle chatbot visibility
  };
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [selectedBiller, setSelectedBiller] = useState("");
  const [product, setProduct] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [billerOptions, setBillerOptions] = useState<OptionObject[]>([]);
  const [productOptions, setProductOptions] = useState<OptionObject[]>([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [xamount, setXamount] = useState(0);
  const [email, setEmail] = useState("");
  const [accountName, setAccountName] = useState("");
  const [, setAccountLen] = useState("");
  // State to track loading
  const [isLoading, setIsLoading] = useState(false);
  const [isAccount, setIsAccount] = useState(false);
  const [preAmount, setPreAmount] = useState(false);

  const [canValidate, setCanValidate] = useState(true);
  const [step, setStep] = useState(1);
  const [xrate] = useState(1500);
  // State to track errors
  const getToken = () => {
    const token = localStorage.getItem("jwt");
    if (token) {
      return token;
    } else {
      console.error("Token not found");
      return null;
    } 
  }
  const Sign = () => {
    const url = import.meta.env.VITE_API_VAS + "/signin";
    const username = import.meta.env.VITE_API_VAS_USERNAME;
    const password = import.meta.env.VITE_API_VAS_PASSWORD;
  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: `${username}`, password:`${password}`}),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.text(); // 👈 retrieve JWT as plain text
      })
      .then(token => {
        console.log('JWT:', token);
        // You can now store it, e.g. in localStorage:
        localStorage.setItem('jwt', token);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    
  };
  // State to track errors
  const [error, setError] = useState(null);
  useEffect(() => {
    Sign();
  }, []); // empty array = runs only once (on mount)

  const api = import.meta.env.VITE_API_VAS;
  const biller = {
    Electricity: "ELECTRIC_DISCO",
    PayTv: "PAY_TV",
    Topup: "AIRTIME_AND_DATA",
  };
  const billproducts = {
    Electricity: [
      "EKEDC",
      "IKEDC",
      "APLE",
      "EEDC",
      "KAEDCO",
      "KEDCO",
      "JEDC",
      "PHED_2",
      "AEDC",
      "IBEDC",
      "BEDC",
      "KADUNA_ELECTRIC",
    ],
    PayTv: ["DSTV", "GOTV", "STARTIMES", "SHOWMAX"],
    Topup: [
      "GLO_NIGERIA",
      "MTN_NIGERIA",
      "AIRTEL_NIGERIA",
      "9MOBILE_NIGERIA",
      "SPECTRANET",
    ],
  };
  const serviceIcons = [
    { name: "Electricity", icon: "⚡" },
    { name: "PayTv", icon: "📺" },
    { name: "Topup", icon: "📱" },
  ];
  interface ApiResponse {
    status: number;
    message: string;
    data: [
      {
        id: number;
        alias: string;
        name: string;
        validation: boolean;
        logoUrl: string;
        amount: number;
        accountNumberSize: number;
      }
    ];
  }
  interface OptionObject {
    value: string;
    label: string;
    amount: number;
  }
  const isFormValid =
    selectedService &&
    selectedBiller &&
    product &&
    accountNumber &&
    amount &&
    email;

  function generateOrderID(): string {
    // Get the current date and format it as YYMMddHHmmss
    const now = new Date();
    const formattedDate = now
      .toISOString()
      .slice(2, 19) // Extract YY-MM-DDTHH:mm:ss
      .replace(/[-T:]/g, ""); // Remove separators to get YYMMddHHmmss

    // Generate a 6-digit random number
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000); // Ensures a 6-digit number

    // Combine the formatted date and random number
    return `${formattedDate}${randomSixDigits}`;
  }
  const cleanString = (input: string): any => {
    if (input.includes("_")) {
      return input.split("_")[1]; // Split the string by "_" and return the second part
    }
    return null; // Return null if "_" is not found
  };
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
  const order = {
    id: generateOrderID(), // Generate a unique order ID
    date: new Date().toLocaleDateString(),
    customer: {
      name: accountName, // Ensure 'accountName' is correctly defined and used
      account: accountNumber,
      contact: email,
    },
    product: {
      productName: product.replace("_", " "), // Replace underscores with spaces
      amount: parseFloat(amount),
    },
    subtotal: amount,
    tax: 0,
    total: amount,
    value: xamount,
  };

  const handleIconClick = async (service: string) => {
    const selectedServiceIcon =
      serviceIcons.find((item) => item.name === service)?.icon || "";
    setSelectedService(service);
    setSelectedIcon(selectedServiceIcon); // Set the selected icon
    setProduct(""); // Reset product selection
    setBillerOptions([]); // Clear biller options
    setProductOptions([]); // Clear product options
    setIsLoading(true);
    setProductLoading(false);
    setError(null);
    setAmount("");
    setEmail("");
    setAccountName("");
    setAccountNumber("");
    setXamount(0);
    setAccountName("");
    console.log(`Selected service: ${service}`);
    console.log(biller);
    const billerCode = biller[service as keyof typeof biller];
    console.log(billerCode);

    if (!billerCode) return;
    if (service === "Topup") {
      setCanValidate(false);
    }
    setIsLoading(true);
    const apiUrl = `${api}/category/drill/${billerCode}`;
    console.log(apiUrl);
    // Fetch data from API
    fetch(apiUrl, {
      method: "GET", // HTTP method
      headers: {
        "Content-Type": "application/json", // Specify the content type
        Authorization: `Bearer ${getToken()}`, // Add Authorization header with the token
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: ApiResponse) => {
        // Assuming the data is an array of objects with { id, name }
        let formattedOptions;
        const productList =
          billproducts[service as keyof typeof billproducts] || [];
        const productSet = new Set(productList);
        formattedOptions = data.data
          .filter((item) => productSet.has(item.alias))
          .map((item) => ({
            value: item.alias,
            label: item.name,
            len: item.accountNumberSize,
            amount: item.amount,
          }));
        console.log(formattedOptions);
        setBillerOptions(formattedOptions);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleProductChange = (selected: any) => {
    setProduct(selected.value);
    setError(null);
   // console.log("Selected Len:", selected.accountlen);
   // console.log("Selected amount:", selected.amount);
    setPreAmount(false);
    if (Number(selected.amount) > 0) {
      //setAmount((parseFloat(selected.amount)/xrate). toFixed(2));
      setAmountChange((parseFloat(selected.amount) / xrate).toFixed(2));
      setPreAmount(true);
    } else setAmount("");
    setAccountLen(selected.len);
  };
  const handleBillerChange = (selected: any) => {
    console.log("Selected Option:", selected.value);
    setSelectedBiller(selected.value);
    //setProduct("");
    setError(null);
   //if (!selectedBiller) return;
    setProductLoading(true);
    console.log(selectedBiller);
    const apiUrl = `${api}/biller/${selected.value}/product`;
    console.log(apiUrl);
    // Fetch data from API
    fetch(apiUrl, {
      method: "GET", // HTTP method
      headers: {
        "Content-Type": "application/json", // Specify the content type
        Authorization: `Bearer ${getToken()}`, // Add Authorization header with the token
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: ApiResponse) => {
        // Assuming the data is an array of objects with { id, name }
        console.log(data.data);
        const formattedOptions = data.data.map((item) => ({
          value: item.alias,
          label: item.name,
          accountlen: item.accountNumberSize,
          amount: item.amount,
        }));
        setProductOptions(formattedOptions);
      })
      .catch((err) => {
        setError(err.message);
        setProductLoading(false);
      })
      .finally(() => {
        setProductLoading(false);
      });
  };
  function setAmountChange(value: string): void {
    setAmount(value);
    if (Number(value) > 0) {
      setXamount(Number(value) * xrate);
      //setXamount(Math.ceil(Number(value) * xrate)); // Round up to the next whole number
    } else {
      setXamount(0);
    }
  }
  function setAccountChange(value: string): void {
    setAccountNumber(value);
  }

  async function verifyAccount(): Promise<boolean> {
    let validated = false;
    setError(null);
    if (!canValidate) {
      setAccountName("N/A");
      return true;
    }
    const apiUrl = `${api}/customer/query`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          account: accountNumber,
          biller: selectedBiller,
          product: product,
          action: "namequery",
          reference: "543657638793903014128121",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to validate account number");
      }

      const data = await response.json();
      if (data.status === 200) {
        validated = true;
        setAccountName(data.data.fullname);
      } else {
        setError(data.message);
        setAccountName("");
      }
    } catch (err: any) {
      setError(err.message);
      setAccountName("");
    }

    return validated;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isFormValid) {
      console.log("step:", step);
      if (step === 1) {
        setIsAccount(true);
        const isValid = await verifyAccount(); // Wait for verifyAccount to complete
        setIsAccount(false);
        if (isValid) {
          setStep(2);
          //console.log("accountName:", accountName);
        }
      } else if (step === 2) {
        setStep(3);
        navigate("/pay", {
          state: {
            orderId: order.id,
            amount: parseFloat(amount),
            customerName: accountName,
            accountNumber: accountNumber,
            biller: selectedBiller,
            xamount: xamount,
            productName: cleanString(product),
            email: email,
          },
        });
      }
    }
  };

  return (
    <div>
      {/* Background Image */}
      <div className="background"></div>
      {/* Left-aligned Form */}
      <div className="form-container">
        <form className="form" onSubmit={(e) => handleSubmit(e)}>
          {/* Icons */}
          {step === 1 && (
            <>
              <h2 className="title">Your fast way to pay bills</h2>
              <p className="subtitle">
                Send gifts to your loved ones abroad with Zobo!
              </p>
              <div className="icons">
                {serviceIcons.map((service) => (
                  <button
                    key={service.name}
                    className={`icon-button ${
                      selectedService === service.name ? "selected" : ""
                    }`}
                    onClick={() => handleIconClick(service.name)}
                    aria-pressed={selectedService === service.name}
                  >
                    {selectedIcon == service.icon}
                    <span className="icon">{service.icon}</span>
                    <p>{service.name}</p>
                  </button>
                ))}
              </div>
              {/*<p className="selected-service">{step}</p>*/}
              {/* Selected Service Display */}
              {/*selectedService && (
              <p className="selected-service">{selectedService}</p>
            )*/}
              {/* Form */}
              <div className="select-container">
                <Select
                  options={billerOptions}
                  name="biller"
                  value={
                    billerOptions.find((opt) => opt.value === selectedBiller) ||
                    null
                  }
                  onChange={handleBillerChange}
                />{" "}
                {isLoading && <div className="spinner"></div>}
              </div>
              {productOptions ? (
                <div className="select-container">
                  <Select
                    options={productOptions}
                    name="product"
                    value={
                      productOptions.find((opt) => opt.value === product) ||
                      null
                    }
                    onChange={handleProductChange}
                    defaultValue={billerOptions[0]}
                  />{" "}
                  {productLoading && <div className="spinner"></div>}
                </div>
              ) : (
                ""
              )}
              <input
                type="text"
                className="input"
                placeholder="Account number"
                value={accountNumber}
                onChange={(e) => setAccountChange(e.target.value)}
              />
              {isAccount && <div className="spinner"></div>}
              {accountName && <p className="xchange-text">{accountName}</p>}

              <input
                type="number"
                className="input"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmountChange(e.target.value)}
                disabled={preAmount}
              />
              {xamount > 0 ? (
                <p className="xchange-text">
                  {formatCurrency(xamount, "NGN", "en-NG")}
                </p>
              ) : (
                ""
              )}

              <input
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}
          {step === 2 && (
            <>
              <button
                className="button-back"
                onClick={() => setStep(step - 1)} // Go back to the previous step
              >
                <span className="icon-back">
                  <i className="fas fa-arrow-left"></i>{" "}
                  {/* FontAwesome back arrow icon */}
                </span>
              </button>
              <div className="confirmation-container">
                <div className="confirmation-header">
                  <CheckCircle className="confirmation-icon" />
                  <h1>Order Summary!</h1>
                </div>

                <div className="payment-details">
                  <p>Order ID: {order.id}</p>
                  <p>Date: {order.date}</p>
                  <p>
                    Total: {formatCurrency(Number(order.total), "USD", "en-US")}
                  </p>
                  <h3>
                    <b>Customer Information:</b>
                  </h3>
                  <p>Name: {order.customer.name}</p>
                  <p>Account: {order.customer.account}</p>
                  <p>Contact: {order.customer.contact}</p>
                  <h3>
                    <b>Product Details:</b>
                  </h3>
                  <p>Provider: {selectedBiller}</p>
                  <p>Product: {order.product.productName}</p>
                  <p>value: {formatCurrency(order.value, "NGN", "en-NG")}</p>
                </div>
              </div>
            </>
          )}
          {/*step === 3 && <Paypal amount={parseFloat(amount)} productName={product.replace('_',' ')} />*/}

          <button
            type="submit"
            className={step > 2 ? `button-grey` : `button`}
            disabled={!isFormValid}
          >
            {step === 1 ? "Proceed" : step === 2 ? "Confirm" : "Proceed to Pay"}
          </button>
        </form>
        {/* Support Link */}
        <p className="support">
          <b>Need Help?</b>{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Prevent default link behavior
              toggleChatbot(); // Toggle the chatbot
            }}
          >
            Click here to chat with us
          </a>
        </p>

        {/* Chatbot Component */}
        {isChatbotOpen && <Chatbot isOpen={isChatbotOpen} />}
        <p className="support">{error && <p className="error">{error}</p>}</p>
      </div>
    </div>
  );
};

export default PaymentForm;
