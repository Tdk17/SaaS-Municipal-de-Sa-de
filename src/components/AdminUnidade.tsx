/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Stethoscope, 
  Smile, 
  Activity 
} from 'lucide-react';
import { MockDb } from '../db/mockDb';
import { Paciente, Agendamento } from '../types';

interface AdminUnidadeProps {
  onLogout: () => void;
  usuarioNome: string;
}

export default function AdminUnidade({ onLogout, usuarioNome }: AdminUnidadeProps) {
  const [uniTab, setUniTab] = useState<'fila' | 'pacientes' | 'novo-paciente' | 'profissionais'>('fila');
  
  // DB States
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => MockDb.getAgendamentos());
  const [pacientes, setPacientes] = useState<Paciente[]>(() => MockDb.getPacientes());
  const [bairros] = useState(() => MockDb.getBairros());
  const [funcionarios] = useState(() => MockDb.getFuncionarios().filter(f => f.unidadeId === 'unit-1'));

  // Search
  const [searchPac, setSearchPac] = useState('');

  // Form New Patient
  const [newPacNome, setNewPacNome] = useState('');
  const [newPacCpf, setNewPacCpf] = useState('');
  const [newPacSus, setNewPacSus] = useState('');
  const [newPacNasc, setNewPacNasc] = useState('');
  const [newPacSexo, setNewPacSexo] = useState<'M' | 'F' | 'Outro'>('F');
  const [newPacTel, setNewPacTel] = useState('');
  const [newPacEnd, setNewPacEnd] = useState('');
  const [newPacAlergias, setNewPacAlergias] = useState('');
  const [newPacSuccess, setNewPacSuccess] = useState(false);

  // Confirm arrival (Status change: 'agendado' -> 'confirmado')
  const handleCheckIn = (agendaId: string) => {
    MockDb.updateAgendamentoStatus(agendaId, 'confirmado');
    setAgendamentos(MockDb.getAgendamentos());
  };

  // Skip triage and send directly to triagem queue (Status change: 'confirmado' -> 'em_triagem')
  const handleSendToTriage = (agendaId: string) => {
    MockDb.updateAgendamentoStatus(agendaId, 'em_triagem');
    setAgendamentos(MockDb.getAgendamentos());
  };

  // Cancel appointment
  const handleCancelAppointment = (agendaId: string) => {
    MockDb.updateAgendamentoStatus(agendaId, 'cancelado');
    setAgendamentos(MockDb.getAgendamentos());
  };

  // Create Patient manually on-site
  const handleCreatePaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPacNome || !newPacCpf || !newPacSus) return;

    const formattedCpf = newPacCpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    
    const newP: Paciente = {
      id: `pac-${Date.now()}`,
      municipioId: 'mun-1',
      unidadeId: 'unit-1', // Default assigned to this UBS
      bairroId: 'b-1',
      agenteSaudeId: 'ag-1',
      medicoResponsavelId: 'med-1',
      dentistaResponsavelId: 'dent-1',
      nome: newPacNome,
      cpf: formattedCpf,
      cartaoSus: newPacSus,
      dataNascimento: newPacNasc || '1990-01-01',
      sexo: newPacSexo,
      telefone: newPacTel || '(44) 99000-0000',
      email: '',
      endereco: newPacEnd || 'Rua Principal s/n',
      numero: '100',
      cep: '87013-000',
      alergias: newPacAlergias || 'Nenhuma informada',
      doencasCronicas: 'Nenhuma',
      medicamentosContinuos: 'Nenhum',
      status: 'ativo'
    };

    MockDb.addPaciente(newP);
    setPacientes(MockDb.getPacientes());

    // Clear Form
    setNewPacNome('');
    setNewPacCpf('');
    setNewPacSus('');
    setNewPacNasc('');
    setNewPacTel('');
    setNewPacEnd('');
    setNewPacAlergias('');
    setNewPacSuccess(true);
    setTimeout(() => setNewPacSuccess(false), 3000);
  };

  const filteredPacientes = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchPac.toLowerCase()) ||
    p.cpf.includes(searchPac) ||
    p.cartaoSus.includes(searchPac)
  );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row" id="admin-unidade-container">
      {/* Local Sidebar */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded border border-emerald-500/30">
              Gestão da Unidade
            </span>
            <h2 className="text-white text-base font-black">UBS Central</h2>
            <p className="text-xs text-slate-400">Administrador: <strong>{usuarioNome}</strong></p>
          </div>

          <nav className="flex flex-col gap-1.5 text-sm font-medium font-sans">
            <button
              onClick={() => setUniTab('fila')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${uniTab === 'fila' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Clock className="w-4 h-4" />
              Fila do Dia e Recepção
              {agendamentos.filter(a => a.status === 'agendado' || a.status === 'confirmado').length > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {agendamentos.filter(a => a.status === 'agendado' || a.status === 'confirmado').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setUniTab('pacientes')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${uniTab === 'pacientes' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Users className="w-4 h-4" />
              Pacientes Cadastrados
            </button>
            <button
              onClick={() => setUniTab('novo-paciente')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${uniTab === 'novo-paciente' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <UserPlus className="w-4 h-4" />
              Ficha Presencial Rápida
            </button>
            <button
              onClick={() => setUniTab('profissionais')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${uniTab === 'profissionais' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Activity className="w-4 h-4" />
              Equipe do Posto
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
        >
          Sair da Unidade
        </button>
      </aside>

      {/* Main Internal Area */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        {/* ==================== SUB-TAB: FILA DO DIA ==================== */}
        {uniTab === 'fila' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Recepção de Pacientes e Triagem</h1>
              <p className="text-sm text-slate-500">Confirme a chegada presencial dos cidadãos agendados e direcione-os para a sala de enfermagem.</p>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
              {/* Daily Queue Panel */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Prontos para Atendimento (Consultas do Dia)</h3>
                  <span className="text-slate-400 font-semibold">{agendamentos.length} agendamentos hoje</span>
                </div>

                <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[60vh]">
                  {agendamentos.map(a => {
                    const p = pacientes.find(pac => pac.id === a.pacienteId);
                    if (!p) return null;
                    
                    return (
                      <div key={a.id} className="p-4 hover:bg-slate-50/50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase text-white ${a.tipoProfissional === 'medico' ? 'bg-sky-600' : 'bg-indigo-600'}`}>
                              {a.tipoProfissional === 'medico' ? 'Médico' : 'Dentista'}
                            </span>
                            <span className="font-mono text-slate-400 font-bold">#{a.senhaFila}</span>
                            <span className="font-semibold text-slate-400">| Horário: {a.horario}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-950 text-sm">{p.nome}</h4>
                          <p className="text-slate-500">CPF: {p.cpf} • Cartão SUS: {p.cartaoSus}</p>
                          {a.observacao && <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">"{a.observacao}"</p>}
                        </div>

                        {/* Action buttons based on state */}
                        <div className="flex flex-wrap gap-2 shrink-0">
                          {a.status === 'agendado' && (
                            <>
                              <button 
                                onClick={() => handleCheckIn(a.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px]"
                              >
                                Confirmar Chegada
                              </button>
                              <button 
                                onClick={() => handleCancelAppointment(a.id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] border border-slate-200"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          
                          {a.status === 'confirmado' && (
                            <button 
                              onClick={() => handleSendToTriage(a.id)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1"
                            >
                              <Activity className="w-3.5 h-3.5" /> Enviar para Triagem
                            </button>
                          )}

                          {a.status === 'em_triagem' && (
                            <span className="px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold text-[10px] animate-pulse">
                              Aguardando Enfermagem
                            </span>
                          )}

                          {a.status === 'atendido' && (
                            <span className="px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded font-bold text-[10px]">
                              Atendimento Concluído
                            </span>
                          )}

                          {a.status === 'cancelado' && (
                            <span className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded font-bold text-[10px]">
                              Cancelado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Triage Overview Sidebar */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
                  Triagem do Dia
                </h3>
                <p className="text-xs text-slate-500">Monitoramento da sala de enfermagem. Os pacientes confirmados entram nesta fila para avaliação de sinais vitais.</p>

                <div className="space-y-3 pt-2 text-xs">
                  {agendamentos.filter(a => a.status === 'em_triagem').map(a => {
                    const p = pacientes.find(pac => pac.id === a.pacienteId);
                    if (!p) return null;
                    return (
                      <div key={a.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{p.nome}</span>
                          <span className="text-slate-400 font-medium block">Senha: <strong>{a.senhaFila}</strong> • {a.horario}</span>
                        </div>
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping shrink-0"></span>
                      </div>
                    );
                  })}
                  {agendamentos.filter(a => a.status === 'em_triagem').length === 0 && (
                    <div className="text-center py-6 text-slate-400 space-y-1">
                      <AlertCircle className="w-5 h-5 mx-auto text-slate-300" />
                      <p>Nenhum paciente aguardando triagem no momento.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: PACIENTES ==================== */}
        {uniTab === 'pacientes' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Histórico de Prontuários</h1>
                <p className="text-sm text-slate-500">Consulte dados pessoais, prontuários, alergias e histórico clínico geral do paciente.</p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por Nome, CPF, SUS..." 
                  value={searchPac}
                  onChange={(e) => setSearchPac(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Paciente</th>
                      <th className="p-4">CPF / Cartão SUS</th>
                      <th className="p-4">Nascimento / Sexo</th>
                      <th className="p-4">Doenças Crônicas</th>
                      <th className="p-4">Alergias Relatadas</th>
                      <th className="p-4">Contato</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredPacientes.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-900 text-sm">{p.nome}</td>
                        <td className="p-4">
                          <span className="block font-semibold">CPF: {p.cpf}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">SUS: {p.cartaoSus}</span>
                        </td>
                        <td className="p-4">
                          <span className="block">{new Date(p.dataNascimento).toLocaleDateString('pt-BR')}</span>
                          <span className="block text-[10px] text-slate-400">{p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Feminino' : 'Outro'}</span>
                        </td>
                        <td className="p-4 font-bold text-red-700">{p.doencasCronicas}</td>
                        <td className="p-4">
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                            {p.alergias}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{p.telefone}</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-200 font-bold uppercase text-[10px]">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: NOVO PACIENTE ==================== */}
        {uniTab === 'novo-paciente' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Ficha Cadastral Rápida de Atendimento</h1>
              <p className="text-sm text-slate-500">Cadastre cidadãos que comparecem presencialmente à unidade para primeiro atendimento e não possuem cadastro digital.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-3xl">
              {newPacSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg font-semibold mb-4">
                  ✓ Ficha cadastral criada! O paciente já está disponível para receber agendamentos ou triagem na fila local.
                </div>
              )}

              <form onSubmit={handleCreatePaciente} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Nome completo do cidadão" 
                      value={newPacNome}
                      onChange={(e) => setNewPacNome(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Data de Nascimento</label>
                    <input 
                      type="date" 
                      value={newPacNasc}
                      onChange={(e) => setNewPacNasc(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">CPF (apenas números)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 11122233344" 
                      value={newPacCpf}
                      onChange={(e) => setNewPacCpf(e.target.value)}
                      required
                      maxLength={11}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Cartão SUS (15 dígitos)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 898001234567890" 
                      value={newPacSus}
                      onChange={(e) => setNewPacSus(e.target.value)}
                      required
                      maxLength={15}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Sexo Biológico</label>
                    <select 
                      value={newPacSexo}
                      onChange={(e: any) => setNewPacSexo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                    >
                      <option value="F">Feminino</option>
                      <option value="M">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Telefone / Whatsapp</label>
                    <input 
                      type="text" 
                      placeholder="Ex: (44) 99911-0000" 
                      value={newPacTel}
                      onChange={(e) => setNewPacTel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Endereço Residencial</label>
                    <input 
                      type="text" 
                      placeholder="Rua, número, bairro..." 
                      value={newPacEnd}
                      onChange={(e) => setNewPacEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Alergias Importantes (se houver)</label>
                  <textarea 
                    rows={2}
                    placeholder="Ex: Penicilina, Corantes, Alimentos..." 
                    value={newPacAlergias}
                    onChange={(e) => setNewPacAlergias(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm transition cursor-pointer text-xs"
                >
                  Registrar Ficha do Paciente
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: PROFISSIONAIS ==================== */}
        {uniTab === 'profissionais' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Escala de Profissionais do Posto</h1>
              <p className="text-sm text-slate-500">Veja quem são os médicos, dentistas, enfermeiros e agentes ativos lotados na UBS Central hoje.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              {funcionarios.map(f => (
                <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3.5 bg-slate-100 rounded-xl text-slate-700">
                      {f.cargo.includes('Médico') ? <Stethoscope className="w-5 h-5" /> : <Smile className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm leading-tight">{f.nome}</h4>
                      <span className="text-[10px] text-sky-600 uppercase font-black tracking-wider block mt-0.5">{f.cargo}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-400">Conselho:</span>
                      <span className="font-mono font-bold text-slate-700">{f.registroProfissional}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-400">Especialidade:</span>
                      <span className="font-bold text-slate-700">{f.especialidade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-400">Status Escala:</span>
                      <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200/50">Ativo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
