/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  ShieldCheck, 
  Ticket, 
  Download, 
  CheckCircle, 
  Inbox,
  PlusCircle
} from 'lucide-react';
import { MockDb } from '../db/mockDb';
import { Agendamento, Receita, Exame, CarteiraVacinacao, Vacina } from '../types';

interface VacinaTomada {
  id: string;
  vacinaNome: string;
  dose: string;
  lote: string;
  dataAplicacao: string;
}

interface PacientePanelProps {
  onLogout: () => void;
  usuarioNome: string;
}

const getVacinasPaciente = (pacienteId: string): VacinaTomada[] => {
  const carteira = MockDb.getCarteiraVacinacao().filter(c => c.pacienteId === pacienteId);
  const vacinas = MockDb.getVacinas();
  return carteira.map(c => {
    const vac = vacinas.find(v => v.id === c.vacinaId);
    return {
      id: c.id,
      vacinaNome: vac ? vac.nome : 'Vacina Geral',
      dose: c.dose,
      lote: c.lote,
      dataAplicacao: c.dataAplicacao
    };
  });
};

export default function PacientePanel({ onLogout, usuarioNome }: PacientePanelProps) {
  const [pacTab, setPacTab] = useState<'dados' | 'agenda' | 'marcar' | 'receitas' | 'exames' | 'vacinas' | 'senha'>('agenda');
  
  // Hardcoded patient for this role: "Ana Maria da Silva" (pac-1)
  const pacienteId = 'pac-1';

  // DB States
  const [paciente] = useState(() => MockDb.getPacientes().find(p => p.id === pacienteId));
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => MockDb.getAgendamentos().filter(a => a.pacienteId === pacienteId));
  const [receitas] = useState<Receita[]>(() => MockDb.getReceitas().filter(r => r.pacienteId === pacienteId));
  const [exames] = useState<Exame[]>(() => MockDb.getExames().filter(e => e.pacienteId === pacienteId));
  const [vacinas] = useState<VacinaTomada[]>(() => getVacinasPaciente(pacienteId));

  // Scheduling form states
  const [selectedProfType, setSelectedProfType] = useState<'medico' | 'dentista'>('medico');
  const [selectedProfId, setSelectedProfId] = useState<string>('med-1');
  const [tipoAtendimento, setTipoAtendimento] = useState<'consulta_medica' | 'consulta_odontologica' | 'retorno' | 'renovacao_receita'>('consulta_medica');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const getAppointmentDuration = (tipo: string): number => {
    return tipo === 'renovacao_receita' ? 15 : 30;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const [hh, mm] = timeStr.split(':').map(Number);
    return hh * 60 + mm;
  };

  const formatMinutesToTime = (totalMin: number): string => {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const timeSlots = [
    '08:00', '08:15', '08:30', '08:45',
    '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '11:45',
    '13:00', '13:15', '13:30', '13:45',
    '14:00', '14:15', '14:30', '14:45',
    '15:00', '15:15', '15:30', '15:45',
    '16:00', '16:15', '16:30', '16:45'
  ];

  const isSlotAvailable = (timeStr: string) => {
    if (!selectedDate || !selectedProfId) return true;
    
    const startNew = parseTimeToMinutes(timeStr);
    const durationNew = getAppointmentDuration(tipoAtendimento);
    const endNew = startNew + durationNew;
    
    const existing = MockDb.getAgendamentos().filter(
      a => a.profissionalId === selectedProfId && 
           a.data === selectedDate && 
           a.status !== 'cancelado'
    );
    
    return !existing.some(a => {
      const startExt = parseTimeToMinutes(a.horario);
      const durationExt = getAppointmentDuration(a.tipoAtendimento);
      const endExt = startExt + durationExt;
      return startNew < endExt && startExt < endNew;
    });
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !selectedProfId) {
      setErrorMsg("Por favor, selecione uma data e um horário disponível.");
      return;
    }
    
    const startNew = parseTimeToMinutes(selectedTime);
    const durationNew = getAppointmentDuration(tipoAtendimento);
    const endNew = startNew + durationNew;
    
    // Check conflicts
    const existing = MockDb.getAgendamentos().filter(
      a => a.profissionalId === selectedProfId && 
           a.data === selectedDate && 
           a.status !== 'cancelado'
    );
    
    const conflict = existing.find(a => {
      const startExt = parseTimeToMinutes(a.horario);
      const durationExt = getAppointmentDuration(a.tipoAtendimento);
      const endExt = startExt + durationExt;
      return startNew < endExt && startExt < endNew;
    });
    
    if (conflict) {
      const durationConf = getAppointmentDuration(conflict.tipoAtendimento);
      setErrorMsg(`Horário ocupado! Conflito com agendamento das ${conflict.horario} às ${formatMinutesToTime(parseTimeToMinutes(conflict.horario) + durationConf)}.`);
      return;
    }
    
    const newAppointment: any = {
      id: `agenda-${Date.now()}`,
      municipioId: 'mun-1',
      unidadeId: 'unit-1',
      pacienteId: pacienteId,
      profissionalId: selectedProfId,
      tipoProfissional: selectedProfType,
      tipoAtendimento: tipoAtendimento,
      data: selectedDate,
      horario: selectedTime,
      status: 'agendado',
      prioridade: 'normal',
      observacao: observacao || (tipoAtendimento === 'renovacao_receita' ? 'Renovação de receita de uso contínuo.' : 'Consulta de rotina.')
    };
    
    MockDb.addAgendamento(newAppointment);
    
    // Refresh local list of agendamentos
    setAgendamentos(MockDb.getAgendamentos().filter(a => a.pacienteId === pacienteId));
    setSuccessMsg("✓ Consulta agendada com sucesso!");
    setErrorMsg("");
    
    // Clean up
    setObservacao("");
    setSelectedTime("");
    
    setTimeout(() => {
      setPacTab('agenda');
      setSuccessMsg("");
    }, 2000);
  };

  // Virtual ticket details: count how many people in same queue have lower queue numbers
  const todayMeeting = agendamentos.find(a => a.status === 'em_triagem' || a.status === 'confirmado' || a.status === 'agendado');
  const peopleAhead = todayMeeting ? MockDb.getAgendamentos().filter(a => a.tipoProfissional === todayMeeting.tipoProfissional && (a.status === 'confirmado' || a.status === 'em_triagem' || a.status === 'agendado') && parseInt(a.senhaFila) < parseInt(todayMeeting.senhaFila)).length : 0;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row" id="paciente-panel-container">
      {/* Sidebar Cidadão */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded border border-emerald-500/30">
              Portal do Paciente SUS
            </span>
            <h2 className="text-white text-base font-black">{paciente?.nome || usuarioNome}</h2>
            <p className="text-xs text-slate-400">Cartão SUS: <strong>{paciente?.cartaoSus || '898000000000000'}</strong></p>
          </div>

          <nav className="flex flex-col gap-1.5 text-sm font-medium">
            <button
              onClick={() => setPacTab('agenda')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${pacTab === 'agenda' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Calendar className="w-4 h-4" />
              Minhas Consultas
              {todayMeeting && (
                <span className="ml-auto w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping shrink-0"></span>
              )}
            </button>
            <button
              onClick={() => setPacTab('marcar')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${pacTab === 'marcar' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <PlusCircle className="w-4 h-4" />
              Marcar Consulta
            </button>
            <button
              onClick={() => setPacTab('receitas')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${pacTab === 'receitas' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <FileText className="w-4 h-4" />
              Minhas Receitas
              {receitas.length > 0 && (
                <span className="ml-auto bg-slate-800 text-slate-400 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-slate-700">
                  {receitas.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setPacTab('exames')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${pacTab === 'exames' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Activity className="w-4 h-4" />
              Resultados de Exames
            </button>
            <button
              onClick={() => setPacTab('vacinas')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${pacTab === 'vacinas' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Carteira de Vacinação
            </button>
            {todayMeeting && (
              <button
                onClick={() => setPacTab('senha')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${pacTab === 'senha' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <Ticket className="w-4 h-4" />
                Senha Virtual do Dia
              </button>
            )}
            <button
              onClick={() => setPacTab('dados')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${pacTab === 'dados' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <User className="w-4 h-4" />
              Meus Dados Clínicos
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 font-sans"
        >
          Sair do Portal
        </button>
      </aside>

      {/* Main clinical space */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        {/* ==================== SUB-TAB: MINHAS CONSULTAS ==================== */}
        {pacTab === 'agenda' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Meu Painel de Consultas</h1>
              <p className="text-sm text-slate-500">Veja seu histórico de agendamentos e acompanhe o status da sua consulta hoje.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">
                Minhas Próximas Consultas
              </div>
              <div className="divide-y divide-slate-100 font-sans">
                {agendamentos.map(a => (
                  <div key={a.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${a.tipoProfissional === 'medico' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                          {a.tipoProfissional === 'medico' ? 'Consulta Médica' : 'Odontologia'}
                        </span>
                        <span className="text-slate-400 font-bold">Data: Hoje • Horário: {a.horario}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">UBS Central de Santa Esperança</h4>
                      <p className="text-slate-500 font-medium">Médico Geral de Equipe • Senha de Chamada: <strong className="text-slate-900 font-mono">#{a.senhaFila}</strong></p>
                    </div>

                    <div className="shrink-0">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border ${a.status === 'agendado' ? 'bg-slate-50 text-slate-600 border-slate-200' : a.status === 'confirmado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : a.status === 'em_triagem' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {a.status === 'agendado' ? 'Agendado' : a.status === 'confirmado' ? 'Presença Confirmada' : a.status === 'em_triagem' ? 'Na Triagem' : a.status}
                      </span>
                    </div>
                  </div>
                ))}
                {agendamentos.length === 0 && (
                  <p className="p-8 text-center text-slate-400">Você não possui nenhum agendamento pendente no momento.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: MARCAR CONSULTA ==================== */}
        {pacTab === 'marcar' && (
          <div className="space-y-6 text-xs max-w-3xl">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Agendar Consulta</h1>
              <p className="text-sm text-slate-500">
                Escolha a especialidade, a data e selecione um dos horários disponíveis. 
                O sistema controla automaticamente intervalos de <strong>30 minutos</strong> para consultas normais e <strong>15 minutos</strong> para renovação de receitas.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-lg font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-lg font-bold">
                ✓ {successMsg}
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <form onSubmit={handleSchedule} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tipo de Profissional</label>
                    <select
                      value={selectedProfType}
                      onChange={(e) => {
                        const val = e.target.value as 'medico' | 'dentista';
                        setSelectedProfType(val);
                        setSelectedProfId(val === 'medico' ? 'med-1' : 'dent-1');
                        setTipoAtendimento(val === 'medico' ? 'consulta_medica' : 'consulta_odontologica');
                        setSelectedTime('');
                        setErrorMsg('');
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                    >
                      <option value="medico">Médico Clínico Geral</option>
                      <option value="dentista">Dentista / Odontologia</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Profissional Selecionado</label>
                    <select
                      value={selectedProfId}
                      onChange={(e) => {
                        setSelectedProfId(e.target.value);
                        setSelectedTime('');
                        setErrorMsg('');
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                    >
                      {selectedProfType === 'medico' ? (
                        <option value="med-1">Dr. Roberto Cavalcanti (CRM/PR 45213) - UBS Central</option>
                      ) : (
                        <option value="dent-1">Dra. Beatriz Santos (CRO/PR 12984) - UBS Central</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Finalidade do Atendimento</label>
                    <select
                      value={tipoAtendimento}
                      onChange={(e: any) => {
                        setTipoAtendimento(e.target.value);
                        setSelectedTime('');
                        setErrorMsg('');
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                    >
                      {selectedProfType === 'medico' ? (
                        <>
                          <option value="consulta_medica">Consulta Médica Geral (30 min)</option>
                          <option value="retorno">Retorno de Consulta (30 min)</option>
                          <option value="renovacao_receita">Renovação de Receita de Uso Contínuo (15 min)</option>
                        </>
                      ) : (
                        <>
                          <option value="consulta_odontologica">Consulta Odontológica Geral (30 min)</option>
                          <option value="retorno">Retorno Odontológico (30 min)</option>
                          <option value="renovacao_receita">Renovação de Receita / Acompanhamento (15 min)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Data da Consulta</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                        setErrorMsg('');
                      }}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Observação / Sintomas</label>
                  <textarea
                    rows={2}
                    placeholder="Escreva brevemente o motivo da consulta ou os medicamentos de uso contínuo que deseja renovar..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                  />
                </div>

                {selectedDate && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                      <label className="font-black text-slate-900 text-xs block">
                        Horários Disponíveis para o dia {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </label>
                      <span className="text-[10px] text-slate-400 font-bold">
                        Duração: {getAppointmentDuration(tipoAtendimento)} minutos
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {timeSlots.map((time) => {
                        const available = isSlotAvailable(time);
                        const isSelected = selectedTime === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={!available}
                            onClick={() => {
                              setSelectedTime(time);
                              setErrorMsg('');
                            }}
                            className={`py-2 px-1 text-center font-mono font-bold text-xs rounded-lg border transition cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20 scale-[1.02]'
                                : available
                                ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 border-slate-200'
                                : 'bg-rose-50/40 text-slate-300 border-rose-100/40 line-through cursor-not-allowed'
                            }`}
                            title={available ? `Disponível (${getAppointmentDuration(tipoAtendimento)} min)` : 'Indisponível (Conflito de Horário)'}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPacTab('agenda')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs transition cursor-pointer border border-slate-200"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime}
                    className={`px-6 py-2 rounded text-xs font-black shadow-sm transition ${
                      selectedDate && selectedTime
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: SENHA VIRTUAL ==================== */}
        {pacTab === 'senha' && todayMeeting && (
          <div className="space-y-6 text-xs max-w-xl mx-auto">
            <div className="border-b border-slate-200 pb-3 text-center">
              <h1 className="text-2xl font-black text-slate-900">Minha Senha Virtual</h1>
              <p className="text-sm text-slate-500">Acompanhe seu lugar na fila de atendimento da UBS sem precisar ficar aguardando de pé no posto.</p>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 text-center space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

              <div className="space-y-1.5">
                <span className="text-xs text-blue-400 font-extrabold uppercase tracking-widest block">Minha Fila de Atendimento</span>
                <h3 className="text-3xl font-black">#{todayMeeting.senhaFila}</h3>
                <span className="text-slate-400 font-medium block">Horário Estimado: {todayMeeting.horario}</span>
              </div>

              {/* Waiting status counter card */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex justify-around">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-black block">Pessoas à Frente</span>
                  <span className="text-2xl font-black text-amber-400">{peopleAhead}</span>
                </div>
                <div className="w-px bg-slate-800"></div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-black block">Status Atual</span>
                  <span className="text-base font-bold text-emerald-400 uppercase animate-pulse">{todayMeeting.status}</span>
                </div>
              </div>

              <p className="text-slate-400 text-[10px] max-w-sm mx-auto leading-relaxed">
                Você receberá um sinal sonoro ou chamada no painel do posto municipal assim que seu número for convocado pelo profissional de saúde.
              </p>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: MINHAS RECEITAS ==================== */}
        {pacTab === 'receitas' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Meu Histórico de Receitas</h1>
              <p className="text-sm text-slate-500">Veja suas receitas médicas prescritas, válidas para retirada na farmácia municipal.</p>
            </div>

            <div className="space-y-4">
              {receitas.map(r => (
                <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-slate-400 font-bold block">Emissão: {new Date(r.dataEmissao).toLocaleDateString('pt-BR')} • Validade: {r.validade}</span>
                      <h4 className="font-extrabold text-slate-950 text-base">Receituário Digital Municipal</h4>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${r.status === 'ativa' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {r.status === 'ativa' ? 'Ativa e Retirável' : 'Já Retirada'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border border-slate-200/50 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {r.medicamentos}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Prescritor ID: {r.profissionalId} ({r.tipoProfissional === 'medico' ? 'Médico' : 'Dentista'})</span>
                    <button 
                      type="button"
                      onClick={() => alert('Download do PDF da receita realizado com sucesso (Simulado)!')}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center gap-1.5 transition border border-slate-200"
                    >
                      <Download className="w-3 h-3" /> Baixar Receita
                    </button>
                  </div>
                </div>
              ))}
              {receitas.length === 0 && (
                <p className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">Nenhuma receita prescrita registrada.</p>
              )}
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: MEUS EXAMES ==================== */}
        {pacTab === 'exames' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Resultados de Exames Laboratoriais</h1>
              <p className="text-sm text-slate-500">Monitore as solicitações de exames de sangue, eletrocardiograma e exames complementares solicitados.</p>
            </div>

            <div className="space-y-4">
              {exames.map(ex => (
                <div key={ex.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Solicitado em {new Date(ex.dataSolicitacao).toLocaleDateString('pt-BR')}</span>
                      <h4 className="font-extrabold text-slate-950 text-base">{ex.tipoExame}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-bold uppercase text-[9px]">
                      {ex.status}
                    </span>
                  </div>
                  <p className="text-slate-500 leading-normal">{ex.descricao}</p>
                </div>
              ))}
              {exames.length === 0 && (
                <p className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">Nenhum exame solicitado recentemente.</p>
              )}
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: VACINAÇÃO ==================== */}
        {pacTab === 'vacinas' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Minha Carteira Nacional de Vacinação</h1>
              <p className="text-sm text-slate-500">Histórico digital unificado de vacinas aplicadas e doses registradas no seu histórico municipal.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Vacina</th>
                      <th className="p-4">Dose / Lote</th>
                      <th className="p-4">Data Aplicação</th>
                      <th className="p-4">Unidade / Local</th>
                      <th className="p-4">Profissional Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {vacinas.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-950 text-sm">{v.vacinaNome}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200/50 uppercase text-[9px]">
                            {v.dose}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">Lote: {v.lote}</span>
                        </td>
                        <td className="p-4 text-slate-500">{new Date(v.dataAplicacao).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4 text-slate-700 font-bold">UBS Central</td>
                        <td className="p-4 text-slate-500 font-normal">Juliana Rocha (Coren-PR)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: MEUS DADOS CLINICOS ==================== */}
        {pacTab === 'dados' && (
          <div className="space-y-6 text-xs max-w-3xl">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Ficha Médica de Segurança</h1>
              <p className="text-sm text-slate-500">Estes dados sensíveis são criptografados e de acesso restrito aos médicos e enfermeiros para atendimento emergencial.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 block font-bold">Alergias Registradas:</span>
                  <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded font-bold block text-center mt-1">
                    {paciente?.alergias || 'Nenhuma'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Doenças Crônicas:</span>
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded font-bold block text-center mt-1">
                    {paciente?.doencasCronicas || 'Nenhuma'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Medicação Contínua:</span>
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded font-bold block text-center mt-1">
                    {paciente?.medicamentosContinuos || 'Nenhum'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Sexo Biológico:</span>
                  <span className="font-bold text-slate-900 block mt-1">Feminino (F)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
