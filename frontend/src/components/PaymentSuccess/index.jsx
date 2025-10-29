import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = ({ paymentId }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/profile");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleClick = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 px-4">
      <div
        onClick={handleClick}
        className="cursor-pointer bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center animate-fade-in hover:shadow-2xl transition"
      >
        <div className="flex justify-center mb-4">
          <FaCheckCircle className="text-green-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-green-700">Payment Successful 🎉 {paymentId}</h2>
        <p className="mt-3 text-gray-600">Your appointment has been successfully confirmed.</p>
        <p className="mt-1 text-sm text-gray-400">Click anywhere here or wait 10 seconds...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
