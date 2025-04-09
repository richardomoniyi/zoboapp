import { useState } from "react";
import { motion } from "framer-motion";

const LeftToRightModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      {/* Button to open modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Open Sidebar
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Modal */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg p-5"
      >
        <h2 className="text-lg font-bold mb-4">Slide-in Modal</h2>
        <p className="text-gray-600">This modal slides in from the left.</p>

        <button
          onClick={() => setIsOpen(false)}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default LeftToRightModal;
