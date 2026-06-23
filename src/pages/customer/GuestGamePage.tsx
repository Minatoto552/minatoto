import React, { useMemo, useState } from 'react';
import { Crown, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Sparkles, Star, Trophy, Zap, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useVrcBarApp, type GameSession } from '../../lib/VrcBarAppContext';

export function GuestGamePage() {
  const { gameSessions, currentUser, startChinchiroGame, users, chinchiroSettings, customerStamps } = useVrcBarApp();
  const [selectedStaff, setSelectedStaff] = useState('');
  const [betPoints, setBetPoints] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRolling, setIsRolling] = useState(false);

  const myGames = (gameSessions || []).filter(game => game.customerMemberId === currentUser?.id);
  const latestGame = myGames[0] || null;
  const maxChallenges = chinchiroSettings?.maxChallengesPer24h ?? 4;
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const usedChallenges = myGames.filter(game => game.startedAt >= last24h && game.status !== 'canceled').length;
  const remainingChallenges = Math.max(0, maxChallenges - usedChallenges);

  const staffUsers = (users || []).filter(user =>
    user.approvalStatus === 'approved' &&
    !user.isDeleted &&
    (user.role === 'staff' || user.role === 'admin' || user.role === 'cast')
  );

  const myPoints = (customerStamps || [])
    .filter(stamp => stamp.customerMemberId === currentUser?.id)
    .reduce((sum, stamp) => sum + (stamp.points ?? (stamp.type === 'spend' ? -1 : 1)), 0);

  const selectedOpponent = useMemo(
    () => staffUsers.find(user => user.id === selectedStaff),
    [selectedStaff, staffUsers],
  );

  const handleStart = async () => {
    if (!selectedStaff || betPoints <= 0 || isRolling) return;
    setErrorMsg('');
    setIsRolling(true);
    try {
      await startChinchiroGame(selectedStaff, betPoints);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'ゲーム開始に失敗しました。');
    } finally {
      setTimeout(() => setIsRolling(false), 900);
    }
  };

  return (
    <div className="app-home-space animate-in fade-in">
      <section className="casino-hero relative overflow-hidden p-5">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-[#d4af37]">Casino Dice</p>
              <h1 className="mt-2 text-3xl font-black text-white">Dice Roulette</h1>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                高級カジノ風チンチロ。BETして従業員と勝負します。
              </p>
            </div>
            <div className={cn('casino-roulette', isRolling && 'casino-roulette-spin')}>
              <Dice5 size={30} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <CasinoStat label="POINT" value={`${myPoints}`} tone="gold" />
            <CasinoStat label="LEFT" value={`${remainingChallenges}`} tone={remainingChallenges ? 'blue' : 'red'} />
            <CasinoStat label="LIMIT" value={`${maxChallenges}/24h`} tone="purple" />
          </div>
        </div>
      </section>

      {errorMsg && (
        <div className="iphone-card neon-alert bg-red-500/10 p-4 text-sm font-bold text-red-200">
          {errorMsg}
        </div>
      )}

      <section className="casino-panel p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4af37]">Battle Setup</p>
            <h2 className="mt-1 text-lg font-black text-white">対戦を開始</h2>
          </div>
          <span className="status-pill status-pill-gold">{betPoints}pt BET</span>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-bold text-gray-400">対戦相手</span>
          <select
            value={selectedStaff}
            onChange={event => setSelectedStaff(event.target.value)}
            className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-base font-bold text-white outline-none focus:border-[#d4af37]"
          >
            <option value="">スタッフ/キャストを選択</option>
            {staffUsers.map(user => (
              <option key={user.id} value={user.id}>{user.displayName}</option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold text-gray-400">BETポイント</span>
          <input
            type="number"
            min={1}
            max={Math.max(myPoints, 1)}
            value={betPoints}
            onChange={event => setBetPoints(Math.max(1, Number(event.target.value) || 1))}
            className="min-h-[52px] w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-xl font-black text-white outline-none focus:border-[#d4af37]"
          />
        </label>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <div className="metric-icon metric-icon-purple">
              <Zap size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">
                {selectedOpponent ? `${selectedOpponent.displayName} と対戦` : '対戦相手を選んでください'}
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                役なしは最大3回まで自動で振り直し。残り挑戦回数は大きく表示しています。
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!selectedStaff || betPoints <= 0 || betPoints > myPoints || remainingChallenges <= 0 || isRolling}
          className="casino-roll-button flex min-h-[58px] w-full items-center justify-center gap-3 rounded-[24px] text-sm font-black tracking-widest disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={20} className={cn(isRolling && 'animate-spin')} />
          {isRolling ? 'ROLLING...' : remainingChallenges <= 0 ? '本日の挑戦回数上限です' : betPoints > myPoints ? 'ポイント不足' : 'DICE ROULETTE START'}
        </button>
      </section>

      {isRolling && (
        <section className="casino-panel result-flash p-5 text-center">
          <div className="mx-auto flex justify-center gap-3">
            {[1, 2, 3].map(index => <RollingDice key={index} delay={index} />)}
          </div>
          <p className="mt-4 text-sm font-black tracking-[0.24em] text-[#f8e7a2]">ROLLING</p>
        </section>
      )}

      {latestGame && <LatestGameCard game={latestGame} />}
    </div>
  );
}

function LatestGameCard({ game }: { game: GameSession }) {
  const isCompleted = game.status === 'completed';
  const isWin = game.result === 'customer_win';
  const isLose = game.result === 'employee_win';
  const isDraw = game.result === 'draw';

  return (
    <section className={cn(
      'casino-panel p-5 space-y-5',
      isCompleted && isWin && 'casino-win-glow',
      isCompleted && isLose && 'casino-lose-dim',
      isCompleted && isDraw && 'casino-draw-glow',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4af37]">Latest Battle</p>
          <h2 className="mt-1 text-lg font-black text-white">最新の対戦</h2>
        </div>
        <span className="status-pill status-pill-gold">{game.betPoints}pt BET</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DiceResultBlock title="あなた" hand={game.customerHand} dice={[game.customerDie1, game.customerDie2, game.customerDie3]} rerolls={game.customerRerollCount ?? 0} active />
        <DiceResultBlock
          title={game.employeeNameSnapshot}
          hand={game.employeeHand || 'ロール待ち'}
          dice={[game.employeeDie1, game.employeeDie2, game.employeeDie3]}
          rerolls={game.employeeRerollCount ?? 0}
          active={Boolean(game.employeeDie1)}
        />
      </div>

      {game.status === 'employee_pending' && (
        <div className="result-card result-card-pending">
          <Star size={28} className="text-[#d4af37] animate-glow-pulse" />
          <div>
            <p className="text-xl font-black text-white">従業員ロール待ち</p>
            <p className="mt-1 text-xs text-gray-400">スタッフ/キャストが振ると結果が確定します。</p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className={cn(
          'result-card',
          isWin && 'result-card-win',
          isLose && 'result-card-lose',
          isDraw && 'result-card-draw',
        )}>
          <Trophy size={32} className={cn(isLose ? 'text-gray-500' : 'text-[#f8e7a2]')} />
          <div>
            <p className="text-2xl font-black text-white">
              {isWin ? 'WIN' : isLose ? 'LOSE' : 'DRAW'}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              {isWin ? `+${game.payoutPoints ?? 0}pt 獲得` : isLose ? 'ポイント獲得なし' : `${game.payoutPoints ?? 0}pt 返還`}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function DiceResultBlock({ title, hand, dice, rerolls, active }: { title: string; hand: string; dice: (number | undefined)[]; rerolls: number; active: boolean }) {
  return (
    <div className={cn('rounded-[26px] border p-4', active ? 'border-[#d4af37]/30 bg-[#d4af37]/8' : 'border-white/10 bg-white/[0.035]')}>
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-black text-white">{title}</p>
        <span className="status-pill">{rerolls > 0 ? `再挑戦 ${rerolls}` : '一発勝負'}</span>
      </div>
      <div className="mt-4 flex justify-center gap-3">
        {dice.map((value, index) => <DiceFace key={index} value={value} active={active} />)}
      </div>
      <p className="mt-4 text-center text-lg font-black text-[#f8e7a2]">{hand}</p>
    </div>
  );
}

function DiceFace({ value, active }: { value?: number; active?: boolean }) {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = value ? icons[value - 1] || Dice1 : Dice5;
  return (
    <div className={cn('dice-cube', !active && 'opacity-45')}>
      <Icon size={34} />
    </div>
  );
}

function RollingDice({ delay }: { delay: number }) {
  const icons: LucideIcon[] = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[delay % icons.length];
  return (
    <div className="dice-cube dice-rolling" style={{ animationDelay: `${delay * 0.12}s` }}>
      <Icon size={36} />
    </div>
  );
}

function CasinoStat({ label, value, tone }: { label: string; value: string; tone: 'gold' | 'blue' | 'purple' | 'red' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <p className="text-[10px] tracking-widest text-gray-500">{label}</p>
      <p className={cn(
        'mt-1 truncate text-lg font-black',
        tone === 'gold' && 'text-[#d4af37]',
        tone === 'blue' && 'text-sky-300',
        tone === 'purple' && 'text-fuchsia-300',
        tone === 'red' && 'text-red-300',
      )}>
        {value}
      </p>
    </div>
  );
}
