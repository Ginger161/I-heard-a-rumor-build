import React, { useState } from 'react';
import { GameState } from '../../engine/types';
import { CHANNELS_DATA } from '../../engine/data/channels';

interface ChannelsDeskProps {
  gameState: GameState;
  onClose: () => void;
  onBuy: (channelId: string) => void;
}

type BranchType = 'STREET' | 'SOCIAL' | 'PRESS' | 'ELITE';

export const ChannelsDesk: React.FC<ChannelsDeskProps> = ({ gameState, onClose, onBuy }) => {
  const [activeTab, setActiveTab] = useState<BranchType>('STREET');
  const branches: BranchType[] = ['STREET', 'SOCIAL', 'PRESS', 'ELITE'];
  const filteredChannels = CHANNELS_DATA.filter(c => c.branch === activeTab);

  return (
    <>
      {/* TRANSLUCENT BACKDROP (Click to close) */}
      <div 
        className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-[2px] z-40"
        onClick={onClose}
      ></div>

      {/* BOTTOM SHEET MODAL */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[#EADCC8] z-50 flex flex-col border-t-4 border-[#1A1A1A] shadow-[0px_-10px_20px_rgba(0,0,0,0.3)] rounded-t-3xl animate-slide-up">
        
        {/* HEADER & TABS */}
        <div className="bg-[#1A1A1A] text-[#F4F1EA] p-3 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-base font-black tracking-widest uppercase font-serif">Channels</span>
            <button 
              onClick={onClose}
              className="w-7 h-7 bg-[#F4F1EA] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-md font-bold text-sm flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
          
          <div className="flex gap-1 overflow-x-auto no-scrollbar pt-1 px-1">
            {branches.map(branch => (
              <button
                key={branch}
                onClick={() => setActiveTab(branch)}
                className={`px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider rounded-t-lg border-2 border-b-0 border-[#1A1A1A] transition-colors cursor-pointer ${
                  activeTab === branch 
                    ? 'bg-[#EADCC8] text-[#1A1A1A]' 
                    : 'bg-[#2B2B2B] text-slate-400 hover:bg-[#3D3D3D]'
                }`}
              >
                {branch}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT LIST (No flavor text, strict button layout) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-2.5 bg-[#EADCC8]">
          {filteredChannels.map(channel => {
            const isUnlocked = gameState.unlockedChannels.includes(channel.id);
            const canAfford = gameState.sparks >= channel.cost;

            return (
              <div 
                key={channel.id} 
                className={`p-3 rounded-xl border-2 border-[#1A1A1A] flex flex-col justify-between relative ${
                  isUnlocked ? 'bg-[#EBE5D9] opacity-60' : 'bg-[#F4F1EA] shadow-[2px_2px_0px_#1A1A1A]'
                }`}
              >
                {isUnlocked && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-xl tracking-widest px-2 py-1 opacity-30 pointer-events-none font-serif">
                    ACQUIRED
                  </div>
                )}

                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#1A1A1A] font-serif leading-tight">{channel.name}</h3>
                    {channel.synergy && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {channel.synergy.map(syn => (
                          <span key={syn} className="text-[8px] font-bold bg-[#1A1A1A] text-white px-1 py-0.5 uppercase tracking-wider rounded-sm">
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="bg-[#FEF3C7] text-[#B45309] font-black text-xs px-2 py-1 rounded border-2 border-[#1A1A1A] flex-shrink-0">
                    {channel.cost} ⚡
                  </span>
                </div>

                {!isUnlocked && (
                  <button
                    onClick={() => onBuy(channel.id)}
                    disabled={!canAfford}
                    className={`w-full py-2 mt-1 font-black text-[10px] tracking-widest uppercase border-2 border-[#1A1A1A] rounded-lg transition-all cursor-pointer ${
                      canAfford 
                        ? 'bg-[#1A1A1A] text-white shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none' 
                        : 'bg-[#D4CFC4] text-slate-500 cursor-not-allowed border-dashed'
                    }`}
                  >
                    {canAfford ? 'Acquire Channel' : 'Insufficient Sparks'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
