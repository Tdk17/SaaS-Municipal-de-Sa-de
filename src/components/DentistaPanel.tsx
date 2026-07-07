/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Smile, 
  FileText, 
  ClipboardList, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  Layers, 
  Check 
} from 'lucide-react';
import { MockDb } from '../db/mockDb';
import { Paciente, Agendamento, ProntuarioOdontologico, Receita } from '../types';

interface DentistaPanelProps {
  onLogout: () => void;
  usuarioNome: string;
}

// Representing 32 teeth (Teeth numbers are standard FDI notation)
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

type ToothStatus = 'saudavel' | 'carie' | 'restaurado' | 'extraido';

export default function DentistaPanel({ onLogout, usuarioNome }: DentistaPanelProps) {
  const [denTab, setDenTab] = useState<'fila' | 'atendimento' | 'historico'>('fila');
  
  // DB States
  const [agendamentos, setAgendamentos] = useState(() => MockDb.getAgendamentos().filter(a => a.tipoProfissional === 'dentista'));
  const [pacientes, setPacientes] = useState<Paciente[]>(() => MockDb.getPacientes());
  const [prontuarios, setProntuarios] = useState<ProntuarioOdontologico[]>(() => MockDb.getProntuariosOdontologicos());

  // Active Consult State
  const [activeAgenda, setActiveAgenda] = useState<Agendamento | null>(null);
  const [activePatient, setActivePatient] = useState<Paciente | null>(null);

  // Form Atendimento
  const [queixa, setQueixa] = useState('');
  const [procedimentos, setProcedimentos] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Interactive Odontograma state (starts healthy)
  const [odontograma, setOdontograma] = useState<Record<number, ToothStatus>>(() => {
    const initial: Record<number, ToothStatus> = {};
    [...UPPER_TEETH, ...LOWER_TEETH].forEach(t => {
      initial[t] = 'saudavel';
    });
    return initial;
  });
  
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  // Prescription Block
  const [prescreverAtivo, setPrescreverAtivo] = useState(false);
  const [medicamentosPrescritos, setMedicamentosPrescritos] = useState('');

  const [atendimentoSucesso, setAtendimentoSucesso] = useState(false);

  // Start Dental consultation
  const handleStartDentistry = (agenda: Agendamento) => {
    const p = pacientes.find(pac => pac.id === agenda.pacienteId);
    if (!p) return;

    setActiveAgenda(agenda);
    setActivePatient(p);
    
    // Reset inputs
    setQueixa('');
    setProcedimentos('');
    setDiagnostico('');
    setObservacoes('');
    setPrescreverAtivo(false);
    setMedicamentosPrescritos('');
    
    // Load existing odontogram if available, else standard healthy
    const lastProntuario = prontuarios.find(pr => pr.pacienteId === p.id);
    if (lastProntuario && lastProntuario.odontogramaEstado) {
      try {
        setOdontograma(JSON.parse(lastProntuario.odontogramaEstado));
      } catch (e) {
        // Fallback
        const initial: Record<number, ToothStatus> = {};
        [...UPPER_TEETH, ...LOWER_TEETH].forEach(t => { initial[t] = 'saudavel'; });
        setOdontograma(initial);
      }
    } else {
      const initial: Record<number, ToothStatus> = {};
      [...UPPER_TEETH, ...LOWER_TEETH].forEach(t => { initial[t] = 'saudavel'; });
      setOdontograma(initial);
    }

    MockDb.updateAgendamentoStatus(agenda.id, 'em_atendimento');
    setAgendamentos(MockDb.getAgendamentos().filter(a => a.tipoProfissional === 'dentista'));
    setDenTab('atendimento');
  };

  // Change individual tooth status
  const handleChangeToothStatus = (tooth: number, status: ToothStatus) => {
    setOdontograma(prev => ({
      ...prev,
      [tooth]: status
    }));
    setSelectedTooth(null);
  };

  // Save consultation
  const handleSaveAtendimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgenda || !activePatient) return;

    // 1. Save Prontuário Odonto
    const newProntuario: ProntuarioOdontologico = {
      id: `po-${Date.now()}`,
      pacienteId: activePatient.id,
      dentistaId: 'dent-1',
      agendamentoId: activeAgenda.id,
      queixaPrincipal: queixa,
      avaliacaoOdontologica: diagnostico || 'Avaliação geral da cavidade bucal realizada.',
      procedimentoRealizado: procedimentos,
      diagnostico,
      odontogramaEstado: JSON.stringify(odontograma),
      observacoes,
      retorno: false,
      dataAtendimento: new Date().toISOString().split('T')[0]
    };
    MockDb.addProntuarioOdontologico(newProntuario);

    // 2. Save Prescription if active
    if (prescreverAtivo && medicamentosPrescritos) {
      const newRec: Receita = {
        id: `rec-${Date.now()}`,
        pacienteId: activePatient.id,
        profissionalId: 'dent-1',
        tipoProfissional: 'dentista',
        agendamentoId: activeAgenda.id,
        tipoReceita: 'simples',
        descricao: 'Receita odontológica.',
        medicamentos: medicamentosPrescritos,
        validade: 'Receita única',
        necessitaViaFisica: false,
        status: 'ativa',
        dataEmissao: new Date().toISOString().split('T')[0]
      };
      MockDb.addReceita(newRec);
    }

    // Update state
    setProntuarios(MockDb.getProntuariosOdontologicos());
    setAgendamentos(MockDb.getAgendamentos().filter(a => a.tipoProfissional === 'dentista'));

    // Reset active
    setActiveAgenda(null);
    setActivePatient(null);
    setAtendimentoSucesso(true);
    setDenTab('fila');
    setTimeout(() => setAtendimentoSucesso(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row" id="dentista-panel-container">
      {/* Sidebar Odonto */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded border border-sky-500/30">
              Prontuário Odonto SUS
            </span>
            <h2 className="text-white text-base font-black">Dra. Beatriz Santos</h2>
            <p className="text-xs text-slate-400">Especialidade: <strong>Clínica / Buco</strong></p>
          </div>

          <nav className="flex flex-col gap-1.5 text-sm font-medium">
            <button
              onClick={() => setDenTab('fila')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${denTab === 'fila' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <ClipboardList className="w-4 h-4" />
              Minha Fila Odonto
              {agendamentos.filter(a => a.status === 'confirmado' || a.status === 'em_triagem').length > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {agendamentos.filter(a => a.status === 'confirmado' || a.status === 'em_triagem').length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (activeAgenda) setDenTab('atendimento');
                else alert('Nenhum atendimento odontológico ativo. Escolha na fila.');
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${denTab === 'atendimento' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Smile className="w-4 h-4" />
              Atendimento Odonto
              {activePatient && <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
            </button>
            <button
              onClick={() => setDenTab('historico')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${denTab === 'historico' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <FileText className="w-4 h-4" />
              Histórico Odonto
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
        >
          Sair do Consultório
        </button>
      </aside>

      {/* Main clinical space */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        {/* ==================== SUB-TAB: FILA ODONTO ==================== */}
        {denTab === 'fila' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Fila Diária de Odontologia</h1>
              <p className="text-sm text-slate-500">Inicie atendimentos buco, restaurações, extrações e profilaxia de pacientes agendados.</p>
            </div>

            {atendimentoSucesso && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg font-bold">
                ✓ Prontuário odontológico e Odontograma interativo salvos com sucesso!
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">
                Aguardando Consulta Odontológica
              </div>
              <div className="divide-y divide-slate-100 font-sans">
                {agendamentos.map(a => {
                  const p = pacientes.find(pac => pac.id === a.pacienteId);
                  if (!p) return null;
                  return (
                    <div key={a.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-600 text-white font-black px-2 py-0.5 rounded text-[9px] uppercase">
                            Odonto
                          </span>
                          <span className="font-mono text-slate-400 font-bold">#{a.senhaFila}</span>
                          <span className="text-slate-400">| Horário: {a.horario}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">{p.nome}</h4>
                        <p className="text-slate-500 font-medium">CPF: {p.cpf} • Nascimento: {new Date(p.dataNascimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="shrink-0">
                        <button 
                          onClick={() => handleStartDentistry(a)}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg cursor-pointer text-xs"
                        >
                          Chamar Cadeira Odonto
                        </button>
                      </div>
                    </div>
                  );
                })}
                {agendamentos.length === 0 && (
                  <p className="p-8 text-center text-slate-400">Nenhum paciente agendado para odontologia hoje.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: CONSULTA ODONTO ==================== */}
        {denTab === 'atendimento' && activePatient && (
          <form onSubmit={handleSaveAtendimento} className="space-y-6 text-xs animate-fade-in" id="atendimento-odontologico-form">
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow">
              <div className="space-y-1">
                <span className="text-xs text-sky-400 font-extrabold uppercase block tracking-widest">Procedimento Odontológico SUS</span>
                <h2 className="text-xl sm:text-2xl font-black">{activePatient.nome}</h2>
                <p className="text-xs text-slate-400 font-medium">SUS: {activePatient.cartaoSus} • CPF: {activePatient.cpf} • Nascimento: {new Date(activePatient.dataNascimento).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Interactive Odontograma Card (The crowning jewel of dental UX!) */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Smile className="w-5 h-5 text-indigo-600" />
                    Odontograma Interativo
                  </h3>
                  <p className="text-slate-400">Clique em qualquer dente para alterar o status clínico atual (Cárie, Restaurado, Extraído).</p>
                </div>

                {/* Color Legend */}
                <div className="flex flex-wrap gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 block border border-emerald-600"></span> Saudável</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 block border border-red-600"></span> Cárie (Tratamento)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-500 block border border-sky-600"></span> Restaurado</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-300 block border border-slate-400"></span> Extraído / Ausente</span>
                </div>
              </div>

              {/* Upper & Lower Teeth Rows mapping */}
              <div className="space-y-6 pt-3 overflow-x-auto">
                {/* Upper Teeth Row */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Arcada Superior</span>
                  <div className="flex justify-center gap-2 min-w-[640px] py-2">
                    {UPPER_TEETH.map(t => {
                      const st = odontograma[t];
                      const colorClass = st === 'carie' ? 'bg-red-500 text-white hover:bg-red-600' : st === 'restaurado' ? 'bg-sky-500 text-white hover:bg-sky-600' : st === 'extraido' ? 'bg-slate-300 text-slate-600 hover:bg-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600';
                      return (
                        <div key={t} className="relative">
                          <button
                            type="button"
                            onClick={() => setSelectedTooth(selectedTooth === t ? null : t)}
                            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-black text-xs transition border cursor-pointer ${colorClass}`}
                          >
                            <span>{t}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lower Teeth Row */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Arcada Inferior</span>
                  <div className="flex justify-center gap-2 min-w-[640px] py-2">
                    {LOWER_TEETH.map(t => {
                      const st = odontograma[t];
                      const colorClass = st === 'carie' ? 'bg-red-500 text-white hover:bg-red-600' : st === 'restaurado' ? 'bg-sky-500 text-white hover:bg-sky-600' : st === 'extraido' ? 'bg-slate-300 text-slate-600 hover:bg-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600';
                      return (
                        <div key={t} className="relative">
                          <button
                            type="button"
                            onClick={() => setSelectedTooth(selectedTooth === t ? null : t)}
                            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-black text-xs transition border cursor-pointer ${colorClass}`}
                          >
                            <span>{t}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick tooth selection popup details */}
                {selectedTooth !== null && (
                  <div className="bg-slate-50 border border-slate-300 p-4 rounded-xl max-w-md mx-auto space-y-2 animate-fade-in text-center">
                    <span className="font-extrabold text-slate-900 block">Classificar Dente #{selectedTooth}</span>
                    <div className="flex justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleChangeToothStatus(selectedTooth, 'saudavel')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                      >
                        Saudável
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleChangeToothStatus(selectedTooth, 'carie')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
                      >
                        Cárie
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleChangeToothStatus(selectedTooth, 'restaurado')}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded"
                      >
                        Restaurado
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleChangeToothStatus(selectedTooth, 'extraido')}
                        className="px-3 py-1.5 bg-slate-400 hover:bg-slate-500 text-white font-bold rounded"
                      >
                        Extraído
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Split Anamnese and Dental details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dental Report */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                  Evolução Odontológica
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Queixa Principal Relatada</label>
                    <textarea 
                      rows={2}
                      value={queixa}
                      onChange={(e) => setQueixa(e.target.value)}
                      required
                      placeholder="Dor de dente aguda, sangramento gengival..."
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Diagnóstico Odontológico</label>
                    <input 
                      type="text" 
                      value={diagnostico}
                      onChange={(e) => setDiagnostico(e.target.value)}
                      required
                      placeholder="Gengivite crônica / Cárie profunda dente 14"
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Procedimentos Clínicos Realizados</label>
                    <textarea 
                      rows={3}
                      value={procedimentos}
                      onChange={(e) => setProcedimentos(e.target.value)}
                      required
                      placeholder="Ex: Restauração em resina fotopolimerizável do dente 14, raspagem supra-gengival..."
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Prescription */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Receita de Medicamentos Odonto
                    </h3>
                    <input 
                      type="checkbox" 
                      checked={prescreverAtivo}
                      onChange={(e) => setPrescreverAtivo(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 cursor-pointer"
                    />
                  </div>

                  {prescreverAtivo && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="font-bold text-slate-700 block">Medicamentos / Antibióticos / Analgésicos</label>
                      <textarea 
                        rows={4}
                        placeholder="Ex: 1. Amoxicilina 500mg — Tomar de 8 em 8 horas por 7 dias."
                        value={medicamentosPrescritos}
                        onChange={(e) => setMedicamentosPrescritos(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <CheckCircle className="w-4 h-4" /> Finalizar Consulta Odonto
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveAgenda(null);
                      setActivePatient(null);
                      setDenTab('fila');
                    }}
                    className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition text-xs"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ==================== SUB-TAB: HISTORICO ODONTO ==================== */}
        {denTab === 'historico' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Histórico de Atendimentos Odontológicos</h1>
              <p className="text-sm text-slate-500">Consulte prontuários e procedimentos anteriores de toda a rede municipal.</p>
            </div>

            <div className="space-y-4">
              {prontuarios.map(pr => {
                const p = pacientes.find(pac => pac.id === pr.pacienteId);
                return (
                  <div key={pr.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Atendimento em: {new Date(pr.dataAtendimento).toLocaleDateString('pt-BR')}</span>
                        <h4 className="font-extrabold text-slate-950 text-sm">{p ? p.nome : 'Paciente Desconhecido'}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
                      <div>
                        <strong className="text-slate-800 block mb-1">Queixa e Diagnóstico:</strong>
                        <p className="bg-slate-50 p-2.5 rounded border border-slate-100">"{pr.queixaPrincipal}"</p>
                        <p className="font-bold text-slate-900 mt-2">Diagnóstico: {pr.diagnostico}</p>
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-1">Procedimentos Clínicos Realizados:</strong>
                        <p className="font-medium text-slate-700">{pr.procedimentosRealizados}</p>
                        {pr.observacoes && <p className="text-[11px] text-slate-400 mt-2">Obs: {pr.observacoes}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
