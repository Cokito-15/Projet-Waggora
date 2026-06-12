import React from 'react';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-white">⚔️ Waggora</div>
        <div className="space-x-4">
          <Link
            href="/login"
            className="px-6 py-2 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-100"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">
          Transform Your Game into a Competitive Arena
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Waggora adds a competitive layer to any mobile game without modifying core gameplay.
          Direct challenges, tokens, marketplace—all with a single API.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Direct Challenges</h3>
            <p className="text-gray-400">Real-time 1v1 battles with token stakes</p>
          </div>

          <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">Token Economy</h3>
            <p className="text-gray-400">Earn, trade, and spend in our marketplace</p>
          </div>

          <div className="bg-white/10 backdrop-blur p-6 rounded-lg border border-white/20">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">Easy Integration</h3>
            <p className="text-gray-400">Add Waggora with just a few API calls</p>
          </div>
        </div>

        <Link
          href="/register"
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 inline-block"
        >
          Get Started Now
        </Link>
      </div>
    </div>
  );
};

export default Home;
