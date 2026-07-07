/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Building, 
  Stethoscope, 
  Smile, 
  Activity, 
  Home, 
  Briefcase, 
  ShieldCheck, 
  CornerDownRight 
} from 'lucide-react';

import AdminSecretaria from './AdminSecretaria';
import AdminUnidade from './AdminUnidade';
import MedicoPanel from './MedicoPanel';
import DentistaPanel from './DentistaPanel';
import TriagemPanel from './TriagemPanel';
import AgenteSaudePanel from './AgenteSaudePanel';
import FarmaciaPanel from './FarmaciaPanel';
import PacientePanel from './PacientePanel';

export default function SistemaInterno() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<
    'admin_geral' | 'admin_unidade' | 'medico' | 'dentista' | 'enfermeiro' | 'agente_saude' | 'farmacia' | 'paciente' | null
  >(null);
  
  const [currentUserName, setCurrentUserName] = useState('');

  // Login Input form states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Login Preset Profiles for immediate pitches and evaluations
  const PRESETS = [
    {
      id: 'admin_geral' as const,
      nome: 'Mariana Silveira',
      cargo: 'Secretária Municipal',
      descricao: 'Gestão de unidades, bairros, profissionais e relatórios da prefeitura.',
      icon: Building,
      color: 'bg-sky-500/10 text-sky-600 border-sky-200/50 hover:bg-sky-500/20'
    },
    {
      id: 'admin_unidade' as const,
      nome: 'Carlos Souza',
      cargo: 'Diretor de Posto (UBS)',
      descricao: 'Recepção, admissões, controle de agendamentos e filas diárias.',
      icon: ShieldCheck,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 hover:bg-emerald-500/20'
    },
    {
      id: 'medico' as const,
      nome: 'Dr. Roberto Cavalcanti',
      cargo: 'Médico Clínico Geral',
      descricao: 'Prontuário eletrônico completo, condutas, prescrições e CID-10.',
      icon: Stethoscope,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50 hover:bg-indigo-500/20'
    },
    {
      id: 'dentista' as const,
      nome: 'Dra. Beatriz Santos',
      cargo: 'Cirurgiã-Dentista',
      descricao: 'Odontograma interativo dente-por-dente com classificação clínica.',
      icon: Smile,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200/50 hover:bg-purple-500/20'
    },
    {
      id: 'enfermeiro' as const,
      nome: 'Juliana Rocha',
      cargo: 'Enfermeiro de Triagem',
      descricao: 'Aferição de sinais vitais e classificação Manchester de risco.',
      icon: Activity,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200/50 hover:bg-amber-500/20'
    },
    {
      id: 'agente_saude' as const,
      nome: 'Marcos Oliveira',
      cargo: 'Agente de Saúde (ACS)',
      descricao: 'Mapeamento territorial, visitas domiciliares, acompanhamento de gestantes.',
      icon: Home,
      color: 'bg-teal-500/10 text-teal-600 border-teal-200/50 hover:bg-teal-500/20'
    },
    {
      id: 'farmacia' as const,
      nome: 'Renata Lins',
      cargo: 'Farmacêutica Municipal',
      descricao: 'Dispensação eletrônica de receitas e reposição do estoque da prefeitura.',
      icon: Briefcase,
      color: 'bg-pink-500/10 text-pink-600 border-pink-200/50 hover:bg-pink-500/20'
    },
    {
      id: 'paciente' as const,
      nome: 'Ana Maria da Silva',
      cargo: 'Paciente / Cidadão',
      descricao: 'Acompanhamento de exames, receitas, carteira de vacinas e senha virtual.',
      icon: User,
      color: 'bg-rose-500/10 text-rose-600 border-rose-200/50 hover:bg-rose-500/20'
    }
  ];

  // Perform Manual Login using standard inputs
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setErrorMessage('Por favor, preencha as credenciais.');
      return;
    }

    // Match simulated profiles
    if (emailInput.includes('mariana') || emailInput.includes('admin')) {
      handlePresetClick('admin_geral', 'Mariana Silveira');
    } else if (emailInput.includes('carlos') || emailInput.includes('diretor')) {
      handlePresetClick('admin_unidade', 'Carlos Souza');
    } else if (emailInput.includes('roberto') || emailInput.includes('medico')) {
      handlePresetClick('medico', 'Dr. Roberto Cavalcanti');
    } else if (emailInput.includes('beatriz') || emailInput.includes('dentista')) {
      handlePresetClick('dentista', 'Dra. Beatriz Santos');
    } else if (emailInput.includes('juliana') || emailInput.includes('enfermeira')) {
      handlePresetClick('enfermeiro', 'Juliana Rocha');
    } else if (emailInput.includes('marcos') || emailInput.includes('agente')) {
      handlePresetClick('agente_saude', 'Marcos Oliveira');
    } else if (emailInput.includes('renata') || emailInput.includes('farmacia')) {
      handlePresetClick('farmacia', 'Renata Lins');
    } else if (emailInput.includes('ana') || emailInput.includes('paciente')) {
      handlePresetClick('paciente', 'Ana Maria da Silva');
    } else {
      setErrorMessage('Credenciais não localizadas no banco de dados da prefeitura.');
    }
  };

  const handlePresetClick = (
    profileId: 'admin_geral' | 'admin_unidade' | 'medico' | 'dentista' | 'enfermeiro' | 'agente_saude' | 'farmacia' | 'paciente',
    name: string
  ) => {
    setCurrentUserName(name);
    setCurrentUserProfile(profileId);
    setIsLoggedIn(true);
    setErrorMessage('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserProfile(null);
    setCurrentUserName('');
    setEmailInput('');
    setPasswordInput('');
  };

  // If Logged in, dynamically switch to appropriate role screen
  if (isLoggedIn && currentUserProfile) {
    switch (currentUserProfile) {
      case 'admin_geral':
        return <AdminSecretaria onLogout={handleLogout} usuarioNome={currentUserName} />;
      case 'admin_unidade':
        return <AdminUnidade onLogout={handleLogout} usuarioNome={currentUserName} />;
      case 'medico':
        return <MedicoPanel onLogout={handleLogout} usuarioNome={currentUserName} />;
      case 'dentista':
        return <DentistaPanel onLogout={handleLogout} usuarioNome={currentUserName} />;
      case 'enfermeiro':
        return <TriagemPanel onLogout={handleLogout} usuarioNome={currentUserName} />;
      case 'agente_saude':
        return <AgenteSaudePanel onLogout={handleLogout} usuarioNome={currentUserName} />;
      case 'farmacia':
        return <FarmaciaPanel onLogout={handleLogout} usuarioNome={currentUserName} />;
      case 'paciente':
        return <PacientePanel onLogout={handleLogout} usuarioNome={currentUserName} />;
      default:
        return <div>Perfil não implementado.</div>;
    }
  }

  return (
    <div className="bg-slate-50 min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6" id="sistema-interno-login-container">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Traditional Login portal */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-1.5 text-center lg:text-left">
            <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-blue-100">
              Acesso Restrito
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">SigaSUS Interno</h1>
            <p className="text-xs text-slate-500 font-medium">Credenciamento de profissionais e servidores da Secretaria de Saúde.</p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded font-bold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Email Institucional ou CPF</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text" 
                  placeholder="Ex: mariana.silveira" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Senha Eletrônica</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-sm transition text-xs uppercase tracking-wider"
            >
              Autenticar Assinatura
            </button>
          </form>

          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 leading-normal">
            Este sistema possui controle de IP e criptografia de ponta a ponta em conformidade estrita com a Lei Geral de Proteção de Dados (LGPD). Qualquer acesso indevido é registrado nos logs de auditoria municipal.
          </div>
        </div>

        {/* Right Column: Dynamic Presets Showcase for immediate pitching! */}
        <div className="lg:col-span-7 space-y-4 font-sans text-xs">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow space-y-1.5 text-center lg:text-left">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Ambiente Demonstrativo Integrado</span>
            <h2 className="text-lg font-black">Portal Multitarefa SaaS Municipal</h2>
            <p className="text-slate-400 text-xs">Para simulações de vendas, licitações, testes e homologação, clique em qualquer perfil abaixo para assumir seu papel instantaneamente.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESETS.map(preset => {
              const IconComp = preset.icon;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset.id, preset.nome)}
                  className={`border border-slate-200 p-4 rounded-xl text-left transition duration-200 flex gap-3.5 group cursor-pointer bg-white hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-sm`}
                >
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-center self-start text-slate-700 group-hover:text-blue-600 group-hover:bg-white transition">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400 group-hover:text-blue-500 transition">
                      {preset.cargo}
                    </span>
                    <strong className="text-slate-900 font-bold block text-sm">
                      {preset.nome}
                    </strong>
                    <p className="text-slate-500 text-[11px] leading-snug">
                      {preset.descricao}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
