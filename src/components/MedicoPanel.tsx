/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Stethoscope, 
  FileText, 
  ClipboardList, 
  Heart, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  Download, 
  User, 
  Layers 
} from 'lucide-react';
import { MockDb } from '../db/mockDb';
import { Paciente, Agendamento, Triagem, ProntuarioMedico, Receita, Exame, Encaminhamento } from '../types';

interface MedicoPanelProps {
  onLogout: () => void;
  usuarioNome: string;
}

export default function MedicoPanel({ onLogout, usuarioNome }: MedicoPanelProps) {
  const [medTab, setMedTab] = useState<'fila' | 'atendimento' | 'historico'>('fila');
  
  // DB States
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => MockDb.getAgendamentos().filter(a => a.tipoProfissional === 'medico'));
  const [pacientes, setPacientes] = useState<Paciente[]>(() => MockDb.getPacientes());
  const [triagens] = useState<Triagem[]>(() => MockDb.getTriagens());
  const [prontuarios, setProntuarios] = useState<ProntuarioMedico[]>(() => MockDb.getProntuariosMedicos());

  // Active Consult State
  const [activeAgenda, setActiveAgenda] = useState<Agendamento | null>(null);
  const [activePatient, setActivePatient] = useState<Paciente | null>(null);
  const [activeTriage, setActiveTriage] = useState<Triagem | null>(null);

  // Form Atendimento
  const [queixa, setQueixa] = useState('');
  const [historico, setHistorico] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [cid, setCid] = useState('');
  const [conduta, setConduta] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [retorno, setRetorno] = useState(false);

  // Prescription block
  const [prescreverAtivo, setPrescreverAtivo] = useState(false);
  const [tipoReceita, setTipoReceita] = useState<'simples' | 'uso_continuo' | 'controlada'>('simples');
  const [medicamentosPrescritos, setMedicamentosPrescritos] = useState('');
  const [validadeReceita, setValidadeReceita] = useState('Receita única');

  // Exam request block
  const [solicitarExameAtivo, setSolicitarExameAtivo] = useState(false);
  const [tipoExame, setTipoExame] = useState('Hemograma Completo');
  const [exameDesc, setExameDesc] = useState('');

  // Referral request block
  const [encaminharAtivo, setEncaminharAtivo] = useState(false);
  const [especialidadeDestino, setEspecialidadeDestino] = useState('Cardiologia');
  const [motivoEncaminhamento, setMotivoEncaminhamento] = useState('');

  const [atendimentoSucesso, setAtendimentoSucesso] = useState(false);

  // Enter consultation
  const handleStartConsultation = (agenda: Agendamento) => {
    const p = pacientes.find(pac => pac.id === agenda.pacienteId);
    if (!p) return;
    
    const t = triagens.find(tr => tr.agendamentoId === agenda.id) || null;
    
    setActiveAgenda(agenda);
    setActivePatient(p);
    setActiveTriage(t);
    
    // Auto populate some defaults or symptoms
    setQueixa(t ? t.sintomas : '');
    setHistorico(p.doencasCronicas ? `Histórico de ${p.doencasCronicas}.` : '');
    setDiagnostico('');
    setCid('');
    setConduta('');
    setObservacoes('');
    setRetorno(false);
    setPrescreverAtivo(false);
    setSolicitarExameAtivo(false);
    setEncaminharAtivo(false);
    setMedicamentosPrescritos('');
    setExameDesc('');
    setMotivoEncaminhamento('');
    
    // Change agendamento status to 'em_atendimento'
    MockDb.updateAgendamentoStatus(agenda.id, 'em_atendimento');
    setAgendamentos(MockDb.getAgendamentos().filter(a => a.tipoProfissional === 'medico'));
    setMedTab('atendimento');
  };

  // Save consultation
  const handleSaveAtendimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgenda || !activePatient) return;

    // 1. Save Prontuário Médico
    const newProntuario: ProntuarioMedico = {
      id: `pm-${Date.now()}`,
      pacienteId: activePatient.id,
      medicoId: 'med-1',
      agendamentoId: activeAgenda.id,
      queixaPrincipal: queixa,
      historico,
      diagnostico,
      cid,
      conduta,
      observacoes,
      retorno,
      dataAtendimento: new Date().toISOString().split('T')[0]
    };
    MockDb.addProntuarioMedico(newProntuario);

    // 2. Save Receita if active
    if (prescreverAtivo && medicamentosPrescritos) {
      const newRec: Receita = {
        id: `rec-${Date.now()}`,
        pacienteId: activePatient.id,
        profissionalId: 'med-1',
        tipoProfissional: 'medico',
        agendamentoId: activeAgenda.id,
        tipoReceita,
        descricao: `Receita médica vinculada ao prontuário CID: ${cid || 'N/A'}.`,
        medicamentos: medicamentosPrescritos,
        validade: validadeReceita,
        necessitaViaFisica: tipoReceita === 'controlada',
        status: 'ativa',
        dataEmissao: new Date().toISOString().split('T')[0]
      };
      MockDb.addReceita(newRec);
    }

    // 3. Save Exame if requested
    if (solicitarExameAtivo && tipoExame) {
      const newEx: Exame = {
        id: `ex-${Date.now()}`,
        pacienteId: activePatient.id,
        medicoId: 'med-1',
        agendamentoId: activeAgenda.id,
        tipoExame,
        descricao: exameDesc || 'Avaliação de rotina',
        status: 'solicitado',
        dataSolicitacao: new Date().toISOString().split('T')[0]
      };
      MockDb.addExame(newEx);
    }

    // 4. Save Encaminhamento if requested
    if (encaminharAtivo && especialidadeDestino) {
      const newEnc: Encaminhamento = {
        id: `enc-${Date.now()}`,
        pacienteId: activePatient.id,
        profissionalId: 'med-1',
        tipoProfissional: 'medico',
        especialidadeDestino,
        motivo: motivoEncaminhamento,
        prioridade: 'normal',
        status: 'pendente',
        dataSolicitacao: new Date().toISOString().split('T')[0]
      };
      MockDb.addEncaminhamento(newEnc);
    }

    // Update local list
    setProntuarios(MockDb.getProntuariosMedicos());
    setAgendamentos(MockDb.getAgendamentos().filter(a => a.tipoProfissional === 'medico'));
    
    // Clear active state
    setActiveAgenda(null);
    setActivePatient(null);
    setActiveTriage(null);
    
    setAtendimentoSucesso(true);
    setMedTab('fila');
    setTimeout(() => setAtendimentoSucesso(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row" id="medico-panel-container">
      {/* Sidebar Médica */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded border border-blue-500/30">
              Prontuário Médico SUS
            </span>
            <h2 className="text-white text-base font-black">Dr. Roberto Cavalcanti</h2>
            <p className="text-xs text-slate-400">Especialidade: <strong>Clínica Geral</strong></p>
          </div>

          <nav className="flex flex-col gap-1.5 text-sm font-medium">
            <button
              onClick={() => setMedTab('fila')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${medTab === 'fila' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <ClipboardList className="w-4 h-4" />
              Minha Fila de Atendimento
              {agendamentos.filter(a => a.status === 'em_triagem' || a.status === 'confirmado').length > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {agendamentos.filter(a => a.status === 'em_triagem' || a.status === 'confirmado').length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (activeAgenda) setMedTab('atendimento');
                else alert('Nenhum atendimento ativo selecionado. Escolha um paciente na fila.');
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${medTab === 'atendimento' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Stethoscope className="w-4 h-4" />
              Consulta Ativa
              {activePatient && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </button>
            <button
              onClick={() => setMedTab('historico')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${medTab === 'historico' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <FileText className="w-4 h-4" />
              Histórico de Atendimentos
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
        >
          Fechar Consultório
        </button>
      </aside>

      {/* Main clinical space */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        {/* ==================== SUB-TAB: FILA MÉDICA ==================== */}
        {medTab === 'fila' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Fila Diária de Consultas</h1>
              <p className="text-sm text-slate-500">Selecione o paciente triado para iniciar a consulta clínica geral e preencher a evolução de prontuário.</p>
            </div>

            {atendimentoSucesso && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg font-bold">
                ✓ Atendimento gravado e finalizado! Os prontuários e receitas foram gerados e sincronizados com a Central do Paciente e Farmácia.
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm">Pacientes na Fila de Espera</h3>
              </div>
              <div className="divide-y divide-slate-100 font-sans">
                {agendamentos.map(a => {
                  const p = pacientes.find(pac => pac.id === a.pacienteId);
                  const t = triagens.find(tr => tr.agendamentoId === a.id);
                  if (!p) return null;
                  
                  return (
                    <div key={a.id} className="p-4 hover:bg-slate-50/50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${a.prioridade === 'preferencial' ? 'bg-amber-600' : 'bg-slate-500'}`}>
                            {a.prioridade}
                          </span>
                          <span className="font-mono text-slate-400 font-bold">#{a.senhaFila}</span>
                          <span className="text-slate-400">| Horário: {a.horario}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{p.nome}</h4>
                        <p className="text-slate-500 font-medium">CPF: {p.cpf} • Nascimento: {new Date(p.dataNascimento).toLocaleDateString('pt-BR')}</p>
                        
                        {/* Triage summary if available */}
                        {t ? (
                          <div className="flex flex-wrap items-center gap-3 pt-1.5 text-[11px] font-bold">
                            <span className={`px-2 py-0.5 rounded text-white font-black uppercase ${t.classificacaoRisco === 'amarelo' ? 'bg-amber-500' : t.classificacaoRisco === 'laranja' ? 'bg-orange-500' : t.classificacaoRisco === 'vermelho' ? 'bg-red-600' : 'bg-blue-500'}`}>
                              Manchester: {t.classificacaoRisco}
                            </span>
                            <span className="text-slate-600">PA: {t.pressao} mmHg</span>
                            <span className="text-slate-600">Temp: {t.temperatura} °C</span>
                            <span className="text-slate-600">Glicemia: {t.glicemia} mg/dL</span>
                            <span className="text-slate-600">Oxig: {t.oxigenacao}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Aguardando aferição de sinais vitais na Triagem de Enfermagem.</span>
                        )}
                      </div>

                      <div className="shrink-0 pt-2 sm:pt-0">
                        <button 
                          onClick={() => handleStartConsultation(a)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm transition"
                        >
                          Chamar Consultório
                        </button>
                      </div>
                    </div>
                  );
                })}
                {agendamentos.length === 0 && (
                  <p className="p-8 text-center text-slate-400">Nenhum paciente agendado para Clínica Geral hoje.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: CONSULTA ATIVA ==================== */}
        {medTab === 'atendimento' && activePatient && (
          <form onSubmit={handleSaveAtendimento} className="space-y-6 animate-fade-in" id="atendimento-medico-form">
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow">
              <div className="space-y-1">
                <span className="text-xs text-blue-400 font-extrabold uppercase block tracking-widest">Evolução de Consulta Ativa</span>
                <h2 className="text-xl sm:text-2xl font-black">{activePatient.nome}</h2>
                <p className="text-xs text-slate-400 font-medium">SUS: {activePatient.cartaoSus} • CPF: {activePatient.cpf} • Nascimento: {new Date(activePatient.dataNascimento).toLocaleDateString('pt-BR')} ({new Date().getFullYear() - new Date(activePatient.dataNascimento).getFullYear()} anos)</p>
              </div>

              {/* Triage vital indicators strip */}
              {activeTriage && (
                <div className="flex flex-wrap gap-2 text-slate-100 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-bold">
                  <div className="px-2.5 py-1 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase">Pressão</span>
                    <span className="text-yellow-400 font-black">{activeTriage.pressao}</span>
                  </div>
                  <div className="w-px bg-slate-800"></div>
                  <div className="px-2.5 py-1 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase">Glicemia</span>
                    <span className="text-emerald-400 font-black">{activeTriage.glicemia} mg/dL</span>
                  </div>
                  <div className="w-px bg-slate-800"></div>
                  <div className="px-2.5 py-1 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase">Temp</span>
                    <span className="text-slate-200 font-black">{activeTriage.temperatura}°C</span>
                  </div>
                  <div className="w-px bg-slate-800"></div>
                  <div className="px-2.5 py-1 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase">Oxig.</span>
                    <span className="text-teal-400 font-black">{activeTriage.oxigenacao}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Layout Split: Left Anamnese, Right prescription/referrals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              {/* Left Column - Anamnese & Clinica */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  Prontuário Médico e Anamnese
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Queixa Principal / Sintomatologia</label>
                    <textarea 
                      rows={2}
                      value={queixa}
                      onChange={(e) => setQueixa(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Histórico da Doença Atual (HDA)</label>
                    <textarea 
                      rows={3}
                      value={historico}
                      onChange={(e) => setHistorico(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="font-bold text-slate-700 block">Diagnóstico Clínico</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Hipertensão Arterial Essencial"
                        value={diagnostico}
                        onChange={(e) => setDiagnostico(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">CID-10</label>
                      <input 
                        type="text" 
                        placeholder="I10" 
                        value={cid}
                        onChange={(e) => setCid(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Conduta Médica & Evolução</label>
                    <textarea 
                      rows={3}
                      value={conduta}
                      onChange={(e) => setConduta(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Alergias warning shown clearly */}
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start gap-2.5 font-semibold">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                    <div>
                      <span className="block text-red-950 font-bold">ALERGIAS RELATADAS:</span>
                      <p>{activePatient.alergias || 'Nenhuma alergia relatada pelo paciente.'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Interactive prescriptions and referrals */}
              <div className="space-y-4">
                {/* Prescription card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Receituário Digital Municipal
                    </h3>
                    <input 
                      type="checkbox" 
                      checked={prescreverAtivo}
                      onChange={(e) => setPrescreverAtivo(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 cursor-pointer"
                    />
                  </div>

                  {prescreverAtivo && (
                    <div className="space-y-3 pt-1 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Tipo de Receita</label>
                          <select 
                            value={tipoReceita}
                            onChange={(e: any) => setTipoReceita(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                          >
                            <option value="simples">Receita Comum</option>
                            <option value="uso_continuo">Uso Contínuo</option>
                            <option value="controlada">Receita Controlada (B1/C1)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Validade</label>
                          <input 
                            type="text" 
                            value={validadeReceita}
                            onChange={(e) => setValidadeReceita(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Medicamentos e Posologia</label>
                        <textarea 
                          rows={4}
                          placeholder="Ex: 1. Losartana 50mg — Tomar 1 comprimido via oral pelas manhãs."
                          value={medicamentosPrescritos}
                          onChange={(e) => setMedicamentosPrescritos(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      {tipoReceita === 'controlada' && (
                        <span className="block text-[10px] text-red-600 bg-red-50 border border-red-200/50 p-2 rounded font-bold">
                          ★ Atenção: Receitas controladas necessitam de via física azul ou amarela oficial fornecida manualmente ao paciente.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Exams and Referrals */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  {/* Exams */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-purple-600" /> Solicitar Exames SUS
                      </h4>
                      <input 
                        type="checkbox" 
                        checked={solicitarExameAtivo}
                        onChange={(e) => setSolicitarExameAtivo(e.target.checked)}
                        className="w-4 h-4 text-purple-600 cursor-pointer"
                      />
                    </div>
                    {solicitarExameAtivo && (
                      <div className="grid grid-cols-2 gap-2 pt-1 animate-fade-in">
                        <select 
                          value={tipoExame}
                          onChange={(e) => setTipoExame(e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded p-1.5 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Hemograma Completo">Hemograma Completo</option>
                          <option value="Eletrocardiograma (ECG)">Eletrocardiograma (ECG)</option>
                          <option value="Urina I e Urocultura">Urina I e Urocultura</option>
                          <option value="Raio-X de Tórax">Raio-X de Tórax</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Recomendações adicionais" 
                          value={exameDesc}
                          onChange={(e) => setExameDesc(e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded p-1.5 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Encaminhamento */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" /> Regulamentar Encaminhamento
                      </h4>
                      <input 
                        type="checkbox" 
                        checked={encaminharAtivo}
                        onChange={(e) => setEncaminharAtivo(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 cursor-pointer"
                      />
                    </div>
                    {encaminharAtivo && (
                      <div className="grid grid-cols-2 gap-2 pt-1 animate-fade-in">
                        <select 
                          value={especialidadeDestino}
                          onChange={(e) => setEspecialidadeDestino(e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded p-1.5 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Cardiologia">Cardiologia</option>
                          <option value="Ortopedia">Ortopedia</option>
                          <option value="Oftalmologia">Oftalmologia</option>
                          <option value="Endocrinologia">Endocrinologia</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Justificativa clínica detalhada" 
                          value={motivoEncaminhamento}
                          onChange={(e) => setMotivoEncaminhamento(e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded p-1.5 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <CheckCircle className="w-4 h-4" /> Finalizar Atendimento e Prontuário
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveAgenda(null);
                      setActivePatient(null);
                      setMedTab('fila');
                    }}
                    className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition text-xs"
                  >
                    Voltar à Fila
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ==================== SUB-TAB: HISTORICO ==================== */}
        {medTab === 'historico' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Histórico de Prontuários Médicos</h1>
              <p className="text-sm text-slate-500">Prontuário eletrônico completo com evolução, CID e conduta de todas as consultas passadas.</p>
            </div>

            <div className="space-y-4">
              {prontuarios.map(pr => {
                const p = pacientes.find(pac => pac.id === pr.pacienteId);
                return (
                  <div key={pr.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Atendimento em: {new Date(pr.dataAtendimento).toLocaleDateString('pt-BR')}</span>
                        <h4 className="font-extrabold text-slate-950 text-base">{p ? p.nome : 'Paciente não identificado'}</h4>
                      </div>
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded font-mono font-bold">
                        CID: {pr.cid}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed text-slate-600">
                      <div>
                        <strong className="text-slate-800 block mb-1">Queixa e Anamnese:</strong>
                        <p className="bg-slate-50 p-2.5 rounded border border-slate-100 italic">"{pr.queixaPrincipal}"</p>
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-1">Diagnóstico e CID:</strong>
                        <p className="font-bold text-slate-900">{pr.diagnostico}</p>
                        <p className="mt-1 text-slate-500 font-medium">Conduta realizada: {pr.conduta}</p>
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
