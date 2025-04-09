import { FormEvent, useState } from "react";
//import { useNavigate } from "react-router-dom";
import "./PaymentForm.css"; // Import custom CSS
import Select from "react-select";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Paypal from "./Paypal";

const PaymentForm = () => {
  const [selectedService, setSelectedService] = useState("");
  const [selectedBiller, setSelectedBiller] = useState("");
  const [product, setProduct] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [billerOptions, setBillerOptions] = useState<OptionObject[]>([]);
  const [productOptions, setProductOptions] = useState<OptionObject[]>([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [proceed, setProceed] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountLen, setAccountLen] = useState("");
  // State to track loading
  const [isLoading, setIsLoading] = useState(false);
  const [isAccount, setIsAccount] = useState(false);
  const [preAmount, setPreAmount] = useState(false);
  const [canPay, setCanPay] = useState(false);
  const [buttonText, setButtonText] = useState("Proceed");
  const [step, setStep] = useState(1);
  // State to track errors
  const [error, setError] = useState(null);
  const api = import.meta.env.VITE_API_URL;
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

  const handlePay = () => {
    setCanPay(true);
  };
  const handleIconClick = async (service: string) => {
    setSelectedService(service);
    setSelectedBiller(""); // Reset biller selection
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
    console.log(`Selected service: ${service}`);
    const TOKEN =
      "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJKV1QiLCJqdGkiOiIxIiwiaXNzIjoiQmxhY2tTaWxpY29uIiwiaWF0IjoxNzQyOTUwMzgxLCJleHAiOjE3NDM1NTUxODF9.9RvhQjuJpF1QEIgLc60XanIwiMaBKlL0f10MvSwWk8penbKu2a5PgQi2WAYbUuCgAF3f7lUML3QKzSN4CdWg7A";
    console.log(biller);
    const billerCode = biller[service as keyof typeof biller];
    console.log(billerCode);
    if (!billerCode) return;
    setIsLoading(true);
    const apiUrl = `http://localhost:8080/AutoPay/app/api/v1/vas/category/drill/${billerCode}`;
    console.log(apiUrl);
    // Fetch data from API
    fetch(apiUrl, {
      method: "GET", // HTTP method
      headers: {
        "Content-Type": "application/json", // Specify the content type
        Authorization: `Bearer ${TOKEN}`, // Add Authorization header with the token
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
    console.log("Selected Len:", selected.accountlen);
    console.log("Selected amount:", selected.amount);
    setPreAmount(false);
    if (Number(selected.amount) > 0) {
      setAmount(selected.amount);
      setPreAmount(true);
    } else setAmount("");
    setAccountLen(selected.len);
  };
  const handleBillerChange = (selected: any) => {
    console.log("Selected Option:", selected.value);
    setSelectedBiller(selected.value);
    //setProduct("");
    setError(null);

    const TOKEN =
      "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJKV1QiLCJqdGkiOiIxIiwiaXNzIjoiQmxhY2tTaWxpY29uIiwiaWF0IjoxNzQyOTUwMzgxLCJleHAiOjE3NDM1NTUxODF9.9RvhQjuJpF1QEIgLc60XanIwiMaBKlL0f10MvSwWk8penbKu2a5PgQi2WAYbUuCgAF3f7lUML3QKzSN4CdWg7A";
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
        Authorization: `Bearer ${TOKEN}`, // Add Authorization header with the token
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
  function setAccountChange(value: string): void {
    setAccountNumber(value);
  }

  async function verifyAccount(): Promise<boolean> {
    let validated = false;
    setError(null);
    const TOKEN =
      "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJKV1QiLCJqdGkiOiIxIiwiaXNzIjoiQmxhY2tTaWxpY29uIiwiaWF0IjoxNzQyOTUwMzgxLCJleHAiOjE3NDM1NTUxODF9.9RvhQjuJpF1QEIgLc60XanIwiMaBKlL0f10MvSwWk8penbKu2a5PgQi2WAYbUuCgAF3f7lUML3QKzSN4CdWg7A";
    const apiUrl = `${api}/customer/query`;
  
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
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
      console.log("1 step:", step);
      if (step === 1) {
        setIsAccount(true)
        const isValid = await verifyAccount(); // Wait for verifyAccount to complete
        setIsAccount(false)
        if (isValid) {
          setStep(2);
          console.log("2 step:", step);
        }
      } else if (step === 2) {
        setStep(3);
        console.log("3 step:", step);
      } else if (step === 3) {
        //window.open('/paypal', '_blank');
      }
    }
  
    const formData = {
      selectedService,
      selectedBiller,
      product,
      accountNumber,
      amount,
      email,
    };
  };

  return (
    <>
      {step == 1 && (
        <div>
          {/* Background Image */}
          <div className="background"></div>

          {/* Left-aligned Form */}
          <div className="form-container">
            <h2 className="title">Welcome to Zobo</h2>
            <p className="subtitle">
              Pay bills or send gifts to your loved ones with Zobo!
            </p>

            {/* Icons */}
            <div className="icons">
              {[
                { name: "Electricity", icon: "⚡" },
                { name: "PayTv", icon: "📺" },
                { name: "Topup", icon: "📱" },
              ].map((service) => (
                <button
                  key={service.name}
                  className={`icon-button ${
                    selectedService === service.name ? "selected" : ""
                  }`}
                  onClick={() => handleIconClick(service.name)}
                  aria-pressed={selectedService === service.name}
                >
                  <span className="icon">{service.icon}</span>
                  <p>{service.name}</p>
                </button>
              ))}
            </div>
            {<p className="selected-service">{step}</p>}
            {/* Selected Service Display */}
            {/*selectedService && (
              <p className="selected-service">{selectedService}</p>
            )*/}

            {/* Form */}
            <form className="form" onSubmit={(e) => handleSubmit(e)}>
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
              {accountName && <p className="selected-service">{accountName}</p>}

              <input
                type="number"
                className="input"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={preAmount}
              />
              <input
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="button" disabled={!isFormValid}>
                {step === 1 ? "Proceed" : step === 2 ? "Confirm" : "Pay"}
              </button>
            </form>

            <p className="support">
              Support: <a href="mailto:support@zobo.ng">support@zobo.ng</a>
            </p>
            <p className="support">
              {error && <p className="error">{error}</p>}
            </p>
          </div>
        </div>
      )}
      {step === 2 && (
        <>
          <div className="background"></div>
          <div className="form-container">
            {/* Back Button Icon */}
            <button className="back-button" onClick={() => setProceed(false)}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="confirmation-container">
              {/* Highlighted Selected Service */}
              <div className="selected-service-highlight">
                {selectedService === "Electricity" && (
                  <div className="icon-highlight">
                    <i className="fas fa-bolt"></i>
                    <p>Electricity</p>
                  </div>
                )}
                {selectedService === "PayTv" && (
                  <div className="icon-highlight">
                    <i className="fas fa-tv"></i>
                    <p>PayTv</p>
                  </div>
                )}
                {selectedService === "Topup" && (
                  <div className="icon-highlight">
                    <i className="fas fa-mobile-alt"></i>
                    <p>Topup</p>
                  </div>
                )}
              </div>
              {/* Payment Details */}
              <div className="payment-details">
                <h2>Confirm Payment</h2>
                <p>
                  <i className="fas fa-concierge-bell"></i> <b>Service:</b>{" "}
                  {selectedService}
                </p>

                <p>
                  <i className="fas fa-building"></i>
                  <b> Biller:</b> {selectedBiller}
                </p>
                <p>
                  <i className="fas fa-box"></i> <b>Product:</b> {product}
                </p>
                <p>
                  <i className="fas fa-concierge-bell"></i>{" "}
                  <b>Customer Name:</b> {accountName}
                </p>
                <p>
                  <i className="fas fa-hashtag"></i> <b>Account Number:</b>{" "}
                  {accountNumber}
                </p>
                <p>
                  <i className="fas fa-money-bill-wave"></i> <b>Amount:</b>{" "}
                  {amount}
                </p>
                <p>
                  <i className="fas fa-envelope"></i>
                  <b> Email:</b> {email}
                </p>
                <button className="button" onClick={handlePay}>
                Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {step === 3 && (<Paypal />)};
      
    </>
  );
};

export default PaymentForm;
