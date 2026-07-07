/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Heart, User, Building, Settings, Sparkles } from 'lucide-react';
import PortalPublico from './components/PortalPublico';
import SistemaInterno from './components/SistemaInterno';
import Logo from './components/Logo';
import { MockDb } from './db/mockDb';

export default function App() {
  const [activePortal, setActivePortal] = useState<'publico' | 'interno'>('publico');
  const [dbVersion, setDbVersion] = useState(0);

  React.useEffect(() => {
    const handleUpdate = () => {
      setDbVersion(prev => prev + 1);
    };
    window.addEventListener('mockdb-updated', handleUpdate);
    return () => {
      window.removeEventListener('mockdb-updated', handleUpdate);
    };
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans selection:bg-blue-500 selection:text-white" id="main-app-container">
      {/* Central Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 text-blue-600 animate-pulse" />
            <div>
            </div>
          </div>

          {/* Tab Navigators */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 text-xs font-sans">
            <button
              onClick={() => setActivePortal('publico')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-bold cursor-pointer ${activePortal === 'publico' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Portal do Cidadão</span>
            </button>
            <button
              onClick={() => setActivePortal('interno')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-bold cursor-pointer ${activePortal === 'interno' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Building className="w-4 h-4 text-blue-600" />
              <span>Sistema Interno (SaaS)</span>
            </button>
          </div>

          {/* Quick Metrics from Design HTML */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400">Espera Média</span>
                <span className="text-blue-600 font-mono text-sm">14 min</span>
              </div>
              <div className="flex flex-col items-end border-l border-slate-200 pl-4">
                <span className="text-[10px] text-slate-400">Consultas Hoje</span>
                <span className="text-slate-700 font-mono text-sm">1.284</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-200/50 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>LGPD Ativa</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Display Content */}
      <main className="flex-1">
        {activePortal === 'publico' ? (
          <PortalPublico onNavigateToLogin={() => setActivePortal('interno')} />
        ) : (
          <SistemaInterno />
        )}
      </main>

      {/* Elegant Municipal Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 font-sans font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>SigaSUS © {new Date().getFullYear()} • Plataforma SaaS de Gestão de Saúde Municipal</span>
          </div>
          <div className="flex gap-4 text-[11px]">
            <a href="#termo-uso" className="hover:text-white transition">Termos de Uso</a>
            <span>•</span>
            <a href="#privacidade" className="hover:text-white transition">Políticas de Privacidade (LGPD)</a>
            <span>•</span>
            <span className="text-slate-500">Desenvolvido em conformidade com o Ministério da Saúde</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

