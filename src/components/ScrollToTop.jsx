import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = ({ isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled upto 400px
  const toggleVisibility = () => {
    if (window.pageYOffset > 400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all duration-300 z-40 hover:-translate-y-1 ${
            isDarkMode 
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20' 
              : 'bg-white text-indigo-600 hover:bg-gray-50 shadow-gray-200 border border-gray-100'
          }`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
