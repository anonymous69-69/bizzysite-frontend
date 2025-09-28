import React from 'react';

const RellaxDemoSection = () => {
  return (
    <section className="relative min-h-screen items-center justify-center overflow-hidden bg-black py-24 px-4 sm:px-6 lg:px-8">
      <div className="rellax absolute top-10 right-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/20 blur-2xl" data-rellax-speed="6"></div>
      <div className="rellax absolute bottom-20 left-20 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/20 blur-2xl" data-rellax-speed="-4"></div>
      <div className="z-10 mx-auto max-w-4xl text-center">
        <h2 className="rellax text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 mb-20" data-rellax-speed="1">
          How To Get Started
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mb-24 text-left">
          <div className="rellax rounded-xl border border-gray-800 bg-gray-900/50 p-6" data-rellax-speed="1">
            <div className="text-3xl font-bold text-indigo-400 mb-3">1.</div>
            <h3 className="text-xl font-semibold mb-2">Add Your Info</h3>
            <p className="text-gray-400">Provide your name, email, and phone number to create your free account.</p>
          </div>
          <div className="rellax rounded-xl border border-gray-800 bg-gray-900/50 p-6" data-rellax-speed="3">
            <div className="text-3xl font-bold text-indigo-400 mb-3">2.</div>
            <h3 className="text-xl font-semibold mb-2">Upload Products</h3>
            <p className="text-gray-400">Add product photos, set your price, and define shipping costs for each item.</p>
          </div>
          <div className="rellax rounded-xl border border-gray-800 bg-gray-900/50 p-6" data-rellax-speed="5">
            <div className="text-3xl font-bold text-indigo-400 mb-3">3.</div>
            <h3 className="text-xl font-semibold mb-2">Customize & Launch</h3>
            <p className="text-gray-400">Choose your website's colors and fonts. Now you're ready to go!</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="rellax" data-rellax-speed="1">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-2">A Truly Free Platform</h3>
            <p className="text-lg text-gray-300 mb-8">
              Yes. You can build, launch, and manage your online store without any monthly fees or hidden costs. We believe in empowering businesses to start and grow without financial barriers.
            </p>
          </div>
          <div className="rellax" data-rellax-speed="2">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-2">We Only Succeed When You Do</h3>
            <p className="text-lg text-gray-300">
              Our business model is designed to be a partnership. Instead of monthly fees, we earn a small 3% commission per transaction. This ensures we're always motivated to provide you with the best tools to help your business thrive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RellaxDemoSection;
