import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, Activity, Info, Menu, X, Landmark } from 'lucide-react';
import { InsuranceProvider } from '../types';

interface NavbarProps {
  providers: InsuranceProvider[];
  selectedProvider: InsuranceProvider;
  onSelectProvider: (provider: InsuranceProvider) => void;
}

export default function Navbar({ providers, selectedProvider, onSelectProvider }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-full w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-inner">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-sans font-bold tracking-tight text-lg text-white">
                Medi<span className="text-emerald-400">Audit</span>
              </span>
              <div className="text-[10px] text-slate-400 font-mono tracking-widest leading-none">
                AI CLAIM AUDITING ENGINE
              </div>
            </div>
          </div>

          {/* Center/Right Desktop: Provider Dropdown */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <Landmark className="h-4 w-4 text-emerald-400" />
              <span>ACTIVE CARRIER:</span>
            </div>

            {/* Provider Selector dropdown */}
            <div className="relative group">
              <button
                id="provider-dropdown-button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 bg-slate-800 border border-slate-700 hover:border-emerald-500 hover:bg-slate-700/50 px-4 py-2 rounded-lg transition-all text-sm font-medium focus:outline-none"
              >
                <span className={`w-3 h-3 rounded-full ${selectedProvider.logoColor}`} />
                <span>{selectedProvider.name}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/80 text-xs font-mono text-slate-400 tracking-wider">
                      SELECT INSURANCE PLAN
                    </div>
                    {providers.map((p) => (
                      <button
                        key={p.id}
                        id={`provider-option-${p.id}`}
                        onClick={() => {
                          onSelectProvider(p);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-start space-x-3 hover:bg-slate-700 transition-colors ${
                          selectedProvider.id === p.id ? 'bg-slate-750 border-l-2 border-emerald-400' : ''
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full mt-1.5 ${p.logoColor} shrink-0`} />
                        <div>
                          <div className="text-sm font-semibold text-slate-200">{p.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">SI: {p.policyDetails.sumInsured}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Policy Info Button */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all focus:outline-none"
              title="View Policy Limits"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Right */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-sm"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${selectedProvider.logoColor}`} />
              <span className="max-w-[120px] truncate">{selectedProvider.shortName}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-1.5 bg-slate-850 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Provider Dropdown Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-850 py-3 px-4 space-y-2">
          <div className="text-[10px] text-slate-400 font-mono tracking-wider mb-1">CHOOSE PROVIDER</div>
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelectProvider(p);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                selectedProvider.id === p.id ? 'bg-slate-800 border border-emerald-500/30' : 'bg-slate-900/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${p.logoColor}`} />
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <span className="text-xs text-slate-400">{p.policyDetails.sumInsured}</span>
            </button>
          ))}
        </div>
      )}

      {/* Drawer: Active Policy details panel */}
      {showInfo && (
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-6 text-slate-300">
          <div className="max-w-full w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
                <h3 className="font-sans font-bold text-sm sm:text-base text-white">
                  Active Policy Rules for {selectedProvider.name}
                </h3>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/60">
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">DURABLE LIMITS</div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Sum Insured:</span>
                  <span className="font-semibold text-white">{selectedProvider.policyDetails.sumInsured}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waiting Period:</span>
                  <span className="font-semibold text-amber-400">{selectedProvider.policyDetails.waitingPeriod}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/60">
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">BED CAPPING RULES</div>
                <div className="flex flex-col space-y-1">
                  <div className="text-slate-400">Normal Room: <span className="font-semibold text-emerald-300">{selectedProvider.policyDetails.roomRentCapping}</span></div>
                  <div className="text-slate-400">ICU Bed rent: <span className="font-semibold text-emerald-300">{selectedProvider.policyDetails.icuCapping}</span></div>
                </div>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/60 sm:col-span-2 lg:col-span-1">
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">CO-PAY & EXCLUSIONS</div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Compulsory Co-pay:</span>
                  <span className="font-semibold text-rose-300">{selectedProvider.policyDetails.copayment}</span>
                </div>
                <div className="text-slate-400 truncate-2-lines text-[11px] mt-1">
                  <span className="font-medium text-slate-300">Excludes: </span>
                  {selectedProvider.policyDetails.exclusions}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
