import './App.css'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaymentForm from "./components/PaymentForm";
import Paypal from "./components/Paypal";


function App() {
  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={
          <>
          <Navbar />
          <PaymentForm />
          </>
          } />
        <Route path="/pay" element={
           <>
          <Navbar />
          <Paypal />
          </>
          } />
      </Routes>
    </Router>
    </>
  )
}
export default App
