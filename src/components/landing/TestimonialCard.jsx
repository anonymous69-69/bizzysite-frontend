import React from 'react';

const TestimonialCard = ({ text, author, role }) => {
  return (
    // REMOVED "mx-4" from this line
    <div className="flex-shrink-0 w-80 sm:w-96 bg-gray-900/60 backdrop-blur-md p-8 rounded-xl border border-gray-700/50 text-center">
      <div className="text-4xl mb-4 text-indigo-400">“</div>
      <p className="mb-6 text-lg text-gray-300">{text}</p>
      <div className="font-semibold text-xl text-white">{author}</div>
      <div className="text-indigo-400">{role}</div>
    </div>
  );
};

export default TestimonialCard;