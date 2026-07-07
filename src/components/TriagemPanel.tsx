/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Activity, 
  ClipboardList, 
  Thermometer, 
  Heart, 
  ShieldAlert, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { MockDb } from '../db/mockDb';
import { Paciente, Agendamento, Triagem, ClassificacaoRisco } from '../types';

interface TriagemPanelProps {
  onLogout: () => void;
  usuarioNome: string;
}

export default function TriagemPanel({ onLogout, usuarioNome }: TriagemPanelProps) {
  const [triTab, setTriTab] = useState<'fila' | 'triar'>('fila');
  
  // DB States
  const [agendamentos, setAgendamentos] = useState(() => MockDb.getAgendamentos());
  const [pacientes, setPacientes] = useState<Paciente[]>(() => MockDb.getPacientes());

  // Active Triagem State
  const [activeAgenda, setActiveAgenda] = useState<Agendamento | null>(null);
  const [activePatient, setActivePatient] = useState<Paciente | null>(null);

  // Form Vital Signs
  const [pressao, setPressao] = useState('120/80');
  const [temperatura, setTemperatura] = useState(36.5);
  const [glicemia, setGlicemia] = useState(90);
  const [oxigenacao, setOxigenacao] = useState(98);
  const [peso, setPeso] = useState(70);
  const [altura, setAltura] = useState(1.70);
  const [sintomas, setSintomas] = useState('');
  const [classificacao, setClassificacao] = useState<ClassificacaoRisco>('verde');

  const [triagemSucesso, setTriagemSucesso] = useState(false);

  // Active waiting queue (Agendamentos with status 'em_triagem')
  const filaEspera = agendamentos.filter(a => a.status === 'em_triagem');

  const handleStartTriagem = (agenda: Agendamento) => {
    const p = pacientes.find(pac => pac.id === agenda.pacienteId);
    if (!p) return;
    
    setActiveAgenda(agenda);
    setActivePatient(p);
    
    // Reset values to defaults
    setPressao('120/80');
    setTemperatura(36.5);
    setGlicemia(90);
    setOxigenacao(98);
    setPeso(p.sexo === 'F' ? 62 : 78);
    setAltura(p.sexo === 'F' ? 1.62 : 1.76);
    setSintomas('');
    setClassificacao('verde');
    
    setTriTab('triar');
  };

  const handleSaveTriagem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgenda || !activePatient) return;

    const numericPeso = parseFloat(peso) || 70;
    const numericAltura = parseFloat(altura) || 1.7;
    const calculatedImc = (numericPeso / (numericAltura * numericAltura)).toFixed(1);

    const newTriagem: Triagem = {
      id: `tri-${Date.now()}`,
      pacienteId: activePatient.id,
      enfermeiroId: 'enfermeiro-1',
      agendamentoId: activeAgenda.id,
      pressao,
      temperatura,
      glicemia,
      oxigenacao,
      peso,
      altura,
      imc: calculatedImc,
      sintomas,
      classificacaoRisco: classificacao,
      dataHora: new Date().toISOString()
    };

    MockDb.addTriagem(newTriagem);
    
    // Update Agendamento status to 'em_triagem' so they are ready for professional calling
    MockDb.updateAgendamentoStatus(activeAgenda.id, 'em_triagem');
    
    // Refresh DB States
    setAgendamentos(MockDb.getAgendamentos());
    
    setActiveAgenda(null);
    setActivePatient(null);
    setTriagemSucesso(true);
    setTriTab('fila');
    setTimeout(() => setTriagemSucesso(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row" id="triagem-panel-container">
      {/* Sidebar Triagem */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded border border-blue-500/30">
              Enfermagem / Manchester
            </span>
            <h2 className="text-white text-base font-black">Triagem de Enfermagem</h2>
            <p className="text-xs text-slate-400">Enfermeira: <strong>{usuarioNome}</strong></p>
          </div>

          <nav className="flex flex-col gap-1.5 text-sm font-medium">
            <button
              onClick={() => setTriTab('fila')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${triTab === 'fila' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <ClipboardList className="w-4 h-4" />
              Pacientes Confirmados
              {filaEspera.length > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {filaEspera.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (activeAgenda) setTriTab('triar');
                else alert('Nenhum paciente selecionado para triagem. Escolha um na fila de espera.');
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${triTab === 'triar' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Activity className="w-4 h-4" />
              Ficha de Sinais Vitais
              {activePatient && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
        >
          Sair do Painel
        </button>
      </aside>

      {/* Main clinical space */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        {/* ==================== SUB-TAB: FILA DE ESPERA ==================== */}
        {triTab === 'fila' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Acolhimento e Triage Manchester</h1>
              <p className="text-sm text-slate-500">Inicie a avaliação de sinais vitais de pacientes confirmados pela recepção municipal.</p>
            </div>

            {triagemSucesso && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg font-bold">
                ✓ Triagem concluída e registrada! O paciente foi encaminhado imediatamente à fila do médico responsável.
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm">Cidadãos Aguardando Sinais Vitais</h3>
              </div>
              <div className="divide-y divide-slate-100 font-sans">
                {filaEspera.map(a => {
                  const p = pacientes.find(pac => pac.id === a.pacienteId);
                  if (!p) return null;
                  return (
                    <div key={a.id} className="p-4 hover:bg-slate-50/50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded text-[9px] uppercase border border-amber-200">
                            Aguardando Triagem
                          </span>
                          <span className="font-mono text-slate-400 font-bold">#{a.senhaFila}</span>
                          <span className="text-slate-400">| Horário original: {a.horario}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">{p.nome}</h4>
                        <p className="text-slate-500 font-medium">CPF: {p.cpf} • Cartão SUS: {p.cartaoSus}</p>
                      </div>

                      <div className="shrink-0">
                        <button 
                          onClick={() => handleStartTriagem(a)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer text-xs"
                        >
                          Chamar para Sala de Enfermagem
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filaEspera.length === 0 && (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-medium text-sm">Fila de triagem vazia. Aguarde o check-in presencial de pacientes na recepção.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: AFERIÇÃO E CLASSIFICAÇÃO ==================== */}
        {triTab === 'triar' && activePatient && (
          <form onSubmit={handleSaveTriagem} className="space-y-6 text-xs animate-fade-in" id="triagem-form">
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow">
              <div className="space-y-1">
                <span className="text-xs text-blue-400 font-extrabold uppercase block tracking-widest">Aferição de Sinais Vitais</span>
                <h2 className="text-xl sm:text-2xl font-black">{activePatient.nome}</h2>
                <p className="text-xs text-slate-400 font-medium">SUS: {activePatient.cartaoSus} • CPF: {activePatient.cpf} • Sexo: {activePatient.sexo === 'F' ? 'Feminino' : 'Masculino'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sinais Vitais Inputs */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                  Sinais Vitais e Antropometria
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Pressão Arterial (PA)</label>
                    <input 
                      type="text" 
                      value={pressao}
                      onChange={(e) => setPressao(e.target.value)}
                      required
                      placeholder="Ex: 120/80"
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Temperatura (°C)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={temperatura}
                      onChange={(e) => setTemperatura(parseFloat(e.target.value) || 36.5)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Glicemia Capilar (mg/dL)</label>
                    <input 
                      type="number" 
                      value={glicemia}
                      onChange={(e) => setGlicemia(parseInt(e.target.value) || 90)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Oxigenação Saturação (%)</label>
                    <input 
                      type="number" 
                      value={oxigenacao}
                      onChange={(e) => setOxigenacao(parseInt(e.target.value) || 98)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Peso Corporal (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={peso}
                      onChange={(e) => setPeso(parseFloat(e.target.value) || 70)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Altura (m)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={altura}
                      onChange={(e) => setAltura(parseFloat(e.target.value) || 1.70)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="font-bold text-slate-700 block">Sintomas Relatados pelo Paciente</label>
                  <textarea 
                    rows={3}
                    placeholder="Ex: Cefaleia intensa, náuseas, tontura há 2 dias..."
                    value={sintomas}
                    onChange={(e) => setSintomas(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Protocolo Manchester Selector */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
                  Protocolo Manchester
                </h3>

                <div className="space-y-2">
                  <span className="text-slate-400 block font-bold">Classificação de Risco:</span>
                  <div className="flex flex-col gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setClassificacao('azul')}
                      className={`p-2.5 rounded-lg border text-left font-black flex items-center justify-between transition cursor-pointer ${classificacao === 'azul' ? 'bg-blue-500 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      <span>AZUL (Não Urgente)</span>
                      <span className="text-[10px]">Limite: 240min</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setClassificacao('verde')}
                      className={`p-2.5 rounded-lg border text-left font-black flex items-center justify-between transition cursor-pointer ${classificacao === 'verde' ? 'bg-green-600 text-white border-green-700' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      <span>VERDE (Pouco Urgente)</span>
                      <span className="text-[10px]">Limite: 120min</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setClassificacao('amarelo')}
                      className={`p-2.5 rounded-lg border text-left font-black flex items-center justify-between transition cursor-pointer ${classificacao === 'amarelo' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      <span>AMARELO (Urgente)</span>
                      <span className="text-[10px]">Limite: 60min</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setClassificacao('laranja')}
                      className={`p-2.5 rounded-lg border text-left font-black flex items-center justify-between transition cursor-pointer ${classificacao === 'laranja' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      <span>LARANJA (Muito Urgente)</span>
                      <span className="text-[10px]">Limite: 10min</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setClassificacao('vermelho')}
                      className={`p-2.5 rounded-lg border text-left font-black flex items-center justify-between transition cursor-pointer ${classificacao === 'vermelho' ? 'bg-red-600 text-white border-red-700' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      <span>VERMELHO (Emergência)</span>
                      <span className="text-[10px]">Imediato</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" /> Registrar Triagem
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveAgenda(null);
                      setActivePatient(null);
                      setTriTab('fila');
                    }}
                    className="px-4 py-3 bg-slate-150 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
