import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Player {
  id: string;
  username: string;
  displayName: string;
  level: number;
  experience: number;
}

interface Wallet {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch player data
        const playerResponse = await fetch('/api/player/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const playerData = await playerResponse.json();
        setPlayer(playerData);

        // Fetch wallet data
        const walletResponse = await fetch('/api/wallet/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const walletData = await walletResponse.json();
        setWallet(walletData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      <nav className="bg-black/50 p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-white">⚔️ Waggora</div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Profile Card */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
            {player && (
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Display Name</p>
                  <p className="text-white font-semibold">{player.displayName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Level</p>
                  <p className="text-white font-semibold text-2xl">{player.level}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Experience</p>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((player.experience % 100) / 100 * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{player.experience} XP</p>
                </div>
              </div>
            )}
          </div>

          {/* Wallet Card */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">💰 Wallet</h2>
            {wallet && (
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Balance</p>
                  <p className="text-white font-bold text-3xl">{wallet.balance}</p>
                  <p className="text-indigo-400 text-sm">Tokens</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-400 text-xs">Total Earned</p>
                    <p className="text-green-400 font-semibold">+{wallet.totalEarned}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Total Spent</p>
                    <p className="text-red-400 font-semibold">-{wallet.totalSpent}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold">
                ⚡ Direct Challenge
              </button>
              <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold">
                🔄 Async Challenge
              </button>
              <button className="w-full py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold">
                🛍️ Marketplace
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Challenges Created</p>
              <p className="text-white text-3xl font-bold">0</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Win Rate</p>
              <p className="text-white text-3xl font-bold">0%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Tokens Played</p>
              <p className="text-white text-3xl font-bold">0</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Rank</p>
              <p className="text-white text-3xl font-bold">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
