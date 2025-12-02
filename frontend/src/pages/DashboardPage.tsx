import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient">Life Improver</h1>
          
          <div className="flex items-center gap-6">
            {/* XP & Coins */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                <span className="text-violet-400">⚡</span>
                <span className="font-semibold">{user?.xp ?? 0} XP</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                <span className="text-yellow-400">🪙</span>
                <span className="font-semibold">{user?.coins ?? 0}</span>
              </div>
            </div>

            {/* Streak */}
            {user?.streak && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-1.5 rounded-lg border border-orange-500/30">
                <span>🔥</span>
                <span className="font-semibold">{user.streak.currentStreak} day streak</span>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              className="text-slate-400 hover:text-white transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <h2 className="text-3xl font-bold mb-4">Welcome back! 👋</h2>
          <p className="text-slate-400 text-lg mb-8">
            Your dashboard is coming soon. We'll build out tasks, goals, and more!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="font-semibold mb-1">Daily Tasks</h3>
              <p className="text-slate-400 text-sm">Track your daily habits</p>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold mb-1">Weekly Goals</h3>
              <p className="text-slate-400 text-sm">Set and achieve goals</p>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-semibold mb-1">Achievements</h3>
              <p className="text-slate-400 text-sm">Unlock rewards</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

