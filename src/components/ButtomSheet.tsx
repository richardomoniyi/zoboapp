import { useState } from "react";
import { motion } from "framer-motion";

const BottomSheet = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSheet = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Button to open the Bottom Sheet */}
      <button
        onClick={toggleSheet}
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg"
      >
        Open Bottom Sheet
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSheet}
        ></div>
      )}

      {/* Bottom Sheet Modal */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isOpen ? 0 : "100%" }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-lg p-6 z-50"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Bottom Sheet</h2>
          <button onClick={toggleSheet} className="text-gray-500 text-2xl">
            ×
          </button>
        </div>
        <p className="text-gray-600 mt-2">
          This is a Bottom Sheet. Swipe down or tap outside to close.
        </p>
      </motion.div>
    </div>
  );
};

export default BottomSheet;
