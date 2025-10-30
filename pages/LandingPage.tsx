
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-3xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-text-primary tracking-tight">
          Industrial SQL Dashboard
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-text-secondary">
          Monitor your factory's pulse in real-time. A fully modular, easy-to-use dashboard that connects directly to your SQL databases.
        </p>
        <div className="mt-8">
          <Link
            to="/demo"
            className="inline-block bg-primary text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-blue-500 transition-transform transform hover:scale-105"
          >
            View Live Demo
          </Link>
        </div>
        <p className="mt-6 text-sm text-text-secondary">
          No signup required. Explore a read-only dashboard with generated data.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
