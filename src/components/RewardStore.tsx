import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Gift,
  Plus,
  Check,
  Tv,
  Coffee,
  Gamepad2,
  Moon,
  BookMarked,
  X,
} from 'lucide-react';
import { RewardItem, StudentProfile, Badge } from '../types/index.ts';
import { getLevelInfo, triggerConfetti } from '../utils/gamification.ts';
import { sound } from '../utils/sound.ts';
import { ASSET_IMAGES } from '../data/initialData.ts';

interface RewardStoreProps {
  profile: StudentProfile;
  rewards: RewardItem[];
  badges: Badge[];
  onRedeemReward: (rewardId: string, cost: number) => boolean;
  onAddCustomReward: (reward: Omit<RewardItem, 'id'>) => void;
}

export const RewardStore: React.FC<RewardStoreProps> = ({
  profile,
  rewards,
  badges,
  onRedeemReward,
  onAddCustomReward,
}) => {
  const levelInfo = getLevelInfo(profile.points);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCost, setCustomCost] = useState(150);
  const [redeemedToast, setRedeemedToast] = useState<string | null>(null);

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv':
        return <Tv className="w-5 h-5 text-indigo-500" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-emerald-500" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-purple-500" />;
      case 'BookMarked':
        return <BookMarked className="w-5 h-5 text-rose-500" />;
      default:
        return <Gift className="w-5 h-5 text-sky-500" />;
    }
  };

  const handleRedeem = (item: RewardItem) => {
    if (profile.points < item.cost) return;

    const success = onRedeemReward(item.id, item.cost);
    if (success) {
      sound.playLevelUp();
      triggerConfetti('celebration');
      setRedeemedToast(`Selamat! Kamu berhasil menukarkan "${item.title}". Selamat menikmati reward!`);
      setTimeout(() => setRedeemedToast(null), 5000);
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    onAddCustomReward({
      title: customTitle.trim(),
      description: customDesc.trim() || 'Hadiah spesial pilihan sendiri',
      cost: Number(customCost),
      iconName: 'Gift',
    });
    setCustomTitle('');
    setCustomDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Level & Trophy Spotlight Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-indigo-800/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 p-1.5 backdrop-blur-xs shrink-0 ring-2 ring-indigo-400/40">
              <img
                src={ASSET_IMAGES.trophy}
                alt="Piala Penghargaan Pelajar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                  Level {levelInfo.level}
                </span>
                <span className="text-white/40">·</span>
                <span className="text-xs text-amber-300 font-medium">
                  {levelInfo.title}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                {profile.name}
              </h2>
              <p className="text-xs text-indigo-200/90 mt-1">
                Kumpulkan poin dari menyelesaikan tugas dan sesi fokus untuk naik pangkat akademik!
              </p>
            </div>
          </div>

          {/* XP Point Balance & Progress */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 w-full md:w-72 shrink-0">
            <div className="flex items-center justify-between text-xs text-indigo-200 mb-1">
              <span>Saldo XP Saat Ini</span>
              <span className="font-mono tabular-nums text-amber-300 font-bold text-sm">
                {profile.points} XP
              </span>
            </div>
            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-indigo-300 mt-1.5">
              <span>{levelInfo.progressPercent}% menuju Level {levelInfo.level + 1}</span>
              <span className="font-mono tabular-nums">{levelInfo.pointsToNext} XP lagi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert for Redeemed Reward */}
      {redeemedToast && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{redeemedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setRedeemedToast(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Gift className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Toko Self-Reward Pelajar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tukarkan hasil kerja keras belajarmu dengan reward menyenangkan tanpa rasa bersalah
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors self-start sm:self-center whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Reward Sendiri</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((item) => {
            const canAfford = profile.points >= item.cost;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getRewardIcon(item.iconName)}
                    </div>
                    <span className="font-mono tabular-nums text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {item.cost} XP
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleRedeem(item)}
                    className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{canAfford ? 'Tukarkan Poin' : `Kurang ${item.cost - profile.points} XP`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Lencana &amp; Pencapaian Akademik
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Milestone belajar yang telah kamu raih sepanjang semester ini
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {badges.map((b) => {
            const isUnlocked = Boolean(b.unlockedAt);
            return (
              <div
                key={b.id}
                className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between ${
                  isUnlocked
                    ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-100 dark:border-slate-800 opacity-50 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {b.title}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {b.description}
                </p>
                <span className="text-[9px] font-semibold mt-2 text-indigo-600 dark:text-indigo-400">
                  {isUnlocked ? 'Tercapai ✓' : 'Terkunci'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Custom Reward */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Buat Hadiah Sendiri
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Hadiah
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli es krim favorit di minimarket"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Syarat Hadiah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Diberikan setelah selesai mengerjakan PR matematika"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Harga Poin XP
                </label>
                <input
                  type="number"
                  min={50}
                  step={25}
                  value={customCost}
                  onChange={(e) => setCustomCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Simpan Hadiah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
