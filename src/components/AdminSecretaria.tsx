/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  MapPin, 
  UserPlus, 
  ShieldCheck, 
  FileSpreadsheet, 
  Plus, 
  CheckCircle, 
  Inbox, 
  ClipboardList, 
  Briefcase, 
  Phone, 
  MessageSquare, 
  Send 
} from 'lucide-react';
import { MockDb } from '../db/mockDb';
import { UnidadeSaude, Bairro, Funcionario, OuvidoriaTicket, TipoUnidade } from '../types';

interface AdminSecretariaProps {
  onLogout: () => void;
  usuarioNome: string;
}

export default function AdminSecretaria({ onLogout, usuarioNome }: AdminSecretariaProps) {
  const [secTab, setSecTab] = useState<'dashboard' | 'unidades' | 'bairros' | 'funcionarios' | 'ouvidoria' | 'auditoria'>('dashboard');

  // DB States
  const [unidades, setUnidades] = useState<UnidadeSaude[]>(() => MockDb.getUnidadesSaude());
  const [bairros, setBairros] = useState<Bairro[]>(() => MockDb.getBairros());
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(() => MockDb.getFuncionarios());
  const [tickets, setTickets] = useState<OuvidoriaTicket[]>(() => MockDb.getOuvidoria());
  const [logs] = useState(() => MockDb.getLogsAuditoria());

  // Form States - Unidade
  const [newUniNome, setNewUniNome] = useState('');
  const [newUniTipo, setNewUniTipo] = useState<TipoUnidade>('UBS');
  const [newUniEnd, setNewUniEnd] = useState('');
  const [newUniTel, setNewUniTel] = useState('');
  const [newUniHor, setNewUniHor] = useState('07:00 às 17:00');
  const [uniSuccess, setUniSuccess] = useState(false);

  // Form States - Bairro
  const [newBaiNome, setNewBaiNome] = useState('');
  const [newBaiUni, setNewBaiUni] = useState(unidades[0]?.id || '');
  const [baiSuccess, setBaiSuccess] = useState(false);

  // Form States - Funcionario
  const [newFunNome, setNewFunNome] = useState('');
  const [newFunCpf, setNewFunCpf] = useState('');
  const [newFunCargo, setNewFunCargo] = useState('Médico Clínico Geral');
  const [newFunReg, setNewFunReg] = useState('');
  const [newFunEsp, setNewFunEsp] = useState('');
  const [newFunUni, setNewFunUni] = useState(unidades[0]?.id || '');
  const [funSuccess, setFunSuccess] = useState(false);

  // Ouvidoria Response
  const [activeTicket, setActiveTicket] = useState<OuvidoriaTicket | null>(null);
  const [ticketReply, setTicketReply] = useState('');

  // Handlers
  const handleAddUnidade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniNome || !newUniEnd) return;
    const newUni: UnidadeSaude = {
      id: `unit-${Date.now()}`,
      municipioId: 'mun-1',
      nome: newUniNome,
      tipoUnidade: newUniTipo,
      endereco: newUniEnd,
      bairroId: 'b-1',
      telefone: newUniTel || '(44) 3211-0000',
      horarioFuncionamento: newUniHor,
      status: 'ativo'
    };
    MockDb.addUnidadeSaude(newUni);
    setUnidades(MockDb.getUnidadesSaude());
    setNewUniNome('');
    setNewUniEnd('');
    setNewUniTel('');
    setUniSuccess(true);
    setTimeout(() => setUniSuccess(false), 3000);
  };

  const handleAddBairro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBaiNome) return;
    const newB: Bairro = {
      id: `b-${Date.now()}`,
      municipioId: 'mun-1',
      nome: newBaiNome,
      unidadeResponsavelId: newBaiUni
    };
    MockDb.addBairro(newB);
    setBairros(MockDb.getBairros());
    setNewBaiNome('');
    setBaiSuccess(true);
    setTimeout(() => setBaiSuccess(false), 3000);
  };

  const handleAddFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunNome || !newFunCpf || !newFunReg) return;
    const formattedCpf = newFunCpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    
    // Create new user profile for them
    const newUsrId = `usr-func-${Date.now()}`;
    const emailPrefix = newFunNome.toLowerCase().split(' ')[0] + '.' + newFunCargo.split(' ')[0].toLowerCase();
    
    const linkedUsuario = {
      id: newUsrId,
      municipioId: 'mun-1',
      nome: newFunNome,
      email: `${emailPrefix}@santaesperanca.pr.gov.br`,
      telefone: '(44) 99888-0000',
      cpf: formattedCpf,
      perfil: newFunCargo.includes('Médico') ? 'medico' as const : newFunCargo.includes('Dentista') ? 'dentista' as const : newFunCargo.includes('Enfermeiro') ? 'enfermeiro' as const : 'agente_saude' as const,
      status: 'ativo' as const
    };

    MockDb.addUsuario(linkedUsuario);

    const newFunc: Funcionario = {
      id: `func-${Date.now()}`,
      usuarioId: newUsrId,
      municipioId: 'mun-1',
      unidadeId: newFunUni,
      nome: newFunNome,
      cpf: formattedCpf,
      cargo: newFunCargo,
      registroProfissional: newFunReg,
      especialidade: newFunEsp || 'Geral',
      status: 'ativo'
    };

    MockDb.addFuncionario(newFunc);
    setFuncionarios(MockDb.getFuncionarios());
    
    setNewFunNome('');
    setNewFunCpf('');
    setNewFunReg('');
    setNewFunEsp('');
    setFunSuccess(true);
    setTimeout(() => setFunSuccess(false), 3000);
  };

  const handleReplyTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !ticketReply) return;
    MockDb.responderOuvidoria(activeTicket.id, ticketReply);
    setTickets(MockDb.getOuvidoria());
    setTicketReply('');
    setActiveTicket(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row" id="admin-secretaria-container">
      {/* Sidebar Restrita */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded border border-sky-500/30">
              Gestão da Secretaria
            </span>
            <h2 className="text-white text-base font-black">Santa Esperança, PR</h2>
            <p className="text-xs text-slate-400">Logado: <strong>{usuarioNome}</strong></p>
          </div>

          <nav className="flex flex-col gap-1.5 text-sm font-medium">
            <button
              onClick={() => setSecTab('dashboard')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${secTab === 'dashboard' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <ClipboardList className="w-4 h-4" />
              Painel Geral
            </button>
            <button
              onClick={() => setSecTab('unidades')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${secTab === 'unidades' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Building className="w-4 h-4" />
              Cadastro de Unidades
            </button>
            <button
              onClick={() => setSecTab('bairros')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${secTab === 'bairros' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <MapPin className="w-4 h-4" />
              Cadastro de Bairros
            </button>
            <button
              onClick={() => setSecTab('funcionarios')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${secTab === 'funcionarios' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <UserPlus className="w-4 h-4" />
              Cadastro Profissionais
            </button>
            <button
              onClick={() => setSecTab('ouvidoria')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${secTab === 'ouvidoria' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <MessageSquare className="w-4 h-4" />
              Ouvidoria SUS
              {tickets.filter(t => t.status === 'novo').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {tickets.filter(t => t.status === 'novo').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSecTab('auditoria')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${secTab === 'auditoria' ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Auditoria de Ações
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
        >
          Desconectar Painel
        </button>
      </aside>

      {/* Area Interna Principal */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        {/* ==================== SUB-TAB: DASHBOARD ==================== */}
        {secTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Dashboard de Indicadores Municipais</h1>
              <p className="text-sm text-slate-500">Monitoramento centralizado da saúde pública municipal em tempo real.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-sky-100 text-sky-700 rounded-lg">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Postos Ativos</span>
                  <span className="text-2xl font-black text-slate-900 block">{unidades.length}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-teal-100 text-teal-700 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Equipe de Saúde</span>
                  <span className="text-2xl font-black text-slate-900 block">{funcionarios.length} servidores</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Prontuários Gravados</span>
                  <span className="text-2xl font-black text-slate-900 block">
                    {MockDb.getProntuariosMedicos().length + MockDb.getProntuariosOdontologicos().length + 104}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chamados Ouvidoria</span>
                  <span className="text-2xl font-black text-slate-900 block">{tickets.length} tickets</span>
                </div>
              </div>
            </div>

            {/* Split Details (SVG Chart + Latest Logs) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphic Representation of atendimentos */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900">Histórico de Atendimentos do Mês</h3>
                <p className="text-xs text-slate-400">Atendimentos clínicos gerais vs. odontológicos preventivos.</p>
                
                {/* Simulated Chart Bars using Tailwind */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Clínico Geral (UBS Central)</span>
                      <span>152 consultas</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Dentista Bucomaxilo / Odonto</span>
                      <span>84 consultas</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '52%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>ESF Jardim Alvorada</span>
                      <span>96 consultas</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Ouvidoria Tickets list */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900">Chamados Recentes Ouvidoria</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {tickets.slice(0, 3).map(t => (
                    <div key={t.id} className="py-2 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 line-clamp-1">{t.assunto}</span>
                        <p className="text-[10px] text-slate-400">Por: {t.pacienteNome} • {new Date(t.dataCriacao).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${t.status === 'novo' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p className="p-4 text-center text-slate-400">Nenhum chamado pendente na Ouvidoria.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: UNIDADES ==================== */}
        {secTab === 'unidades' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Cadastro de Unidades de Saúde</h1>
              <p className="text-sm text-slate-500">Adicione novas UBS, ESF, Farmácias e postos no sistema municipal.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form panel */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 h-fit">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-sky-600" /> Nova Unidade
                </h3>
                
                {uniSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3 rounded font-semibold">
                    Unidade cadastrada com sucesso!
                  </div>
                )}

                <form onSubmit={handleAddUnidade} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Nome da Unidade</label>
                    <input 
                      type="text" 
                      placeholder="Ex: UBS Central Dr. Paulo" 
                      value={newUniNome}
                      onChange={(e) => setNewUniNome(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Tipo de Unidade</label>
                    <select 
                      value={newUniTipo}
                      onChange={(e: any) => setNewUniTipo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="UBS">Unidade Básica de Saúde (UBS)</option>
                      <option value="ESF">Estratégia Saúde da Família (ESF)</option>
                      <option value="Posto de Saúde">Posto de Saúde</option>
                      <option value="Farmácia Municipal">Farmácia Municipal</option>
                      <option value="Unidade Odontológica">Unidade Odontológica</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Endereço Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Av. Brasil, 420 - Centro" 
                      value={newUniEnd}
                      onChange={(e) => setNewUniEnd(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Telefone de Contato</label>
                    <input 
                      type="text" 
                      placeholder="Ex: (44) 3211-1234" 
                      value={newUniTel}
                      onChange={(e) => setNewUniTel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded shadow-sm transition"
                  >
                    Cadastrar Unidade
                  </button>
                </form>
              </div>

              {/* Units List */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Unidades Registradas no Município</h3>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {unidades.map(u => (
                    <div key={u.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="inline-block bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                          {u.tipoUnidade}
                        </span>
                        <h4 className="font-bold text-slate-900 mt-1">{u.nome}</h4>
                        <p className="text-slate-500 mt-0.5">{u.endereco}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-slate-600">
                        <div className="text-right">
                          <span className="font-semibold block">{u.telefone}</span>
                          <span className="text-[10px] text-slate-400 block">{u.horarioFuncionamento}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-200 font-bold">
                          Ativa
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: BAIRROS ==================== */}
        {secTab === 'bairros' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Cadastro de Bairros Municipais</h1>
              <p className="text-sm text-slate-500">Mapeie bairros e vincule-os à unidade de saúde responsável pela sua cobertura territorial.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Bairro */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 h-fit text-xs">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-sky-600" /> Adicionar Bairro
                </h3>

                {baiSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded font-semibold">
                    Bairro vinculado com sucesso!
                  </div>
                )}

                <form onSubmit={handleAddBairro} className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Nome do Bairro</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Jardim Oásis" 
                      value={newBaiNome}
                      onChange={(e) => setNewBaiNome(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Unidade de Saúde Referência</label>
                    <select 
                      value={newBaiUni}
                      onChange={(e) => setNewBaiUni(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                    >
                      {unidades.map(u => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded shadow-sm transition"
                  >
                    Vincular Bairro
                  </button>
                </form>
              </div>

              {/* Bairros List */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Cobertura Geográfica de Postos</h3>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {bairros.map(b => {
                    const u = unidades.find(uni => uni.id === b.unidadeResponsavelId);
                    return (
                      <div key={b.id} className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{b.nome}</h4>
                          <span className="text-slate-400">Município de Santa Esperança</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 font-medium">Unidade Responsável:</span>
                          <span className="block font-bold text-sky-700">{u ? u.nome : 'Sem vínculo'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: FUNCIONARIOS ==================== */}
        {secTab === 'funcionarios' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Cadastro de Profissionais de Saúde</h1>
              <p className="text-sm text-slate-500">Cadastre médicos, dentistas, enfermeiros e agentes comunitários vinculados às unidades locais.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Professional */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 h-fit text-xs">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sky-600" /> Cadastrar Servidor
                </h3>

                {funSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded font-semibold">
                    Profissional cadastrado e perfil criado!
                  </div>
                )}

                <form onSubmit={handleAddFuncionario} className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Dra. Juliana Camargo" 
                      value={newFunNome}
                      onChange={(e) => setNewFunNome(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">CPF</label>
                      <input 
                        type="text" 
                        placeholder="00000000000" 
                        value={newFunCpf}
                        onChange={(e) => setNewFunCpf(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Reg. Profissional</label>
                      <input 
                        type="text" 
                        placeholder="Ex: CRM/PR 12345" 
                        value={newFunReg}
                        onChange={(e) => setNewFunReg(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Cargo / Atuação</label>
                      <select 
                        value={newFunCargo}
                        onChange={(e) => setNewFunCargo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                      >
                        <option value="Médico Clínico Geral">Médico Clínico Geral</option>
                        <option value="Dentista Odontopediatra">Dentista Odontopediatra</option>
                        <option value="Enfermeiro de Triagem">Enfermeiro de Triagem</option>
                        <option value="Agente Comunitário de Saúde">Agente Comunitário de Saúde</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Especialidade / Foco</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Cardiologia, Bucal" 
                        value={newFunEsp}
                        onChange={(e) => setNewFunEsp(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Sede da Unidade de Lotação</label>
                    <select 
                      value={newFunUni}
                      onChange={(e) => setNewFunUni(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
                    >
                      {unidades.map(u => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded shadow-sm transition cursor-pointer"
                  >
                    Gravar e Ativar Acesso
                  </button>
                </form>
              </div>

              {/* Staff List */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Servidores Municipais Ativos</h3>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {funcionarios.map(f => {
                    const u = unidades.find(uni => uni.id === f.unidadeId);
                    return (
                      <div key={f.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h4 className="font-bold text-slate-950 text-sm">{f.nome}</h4>
                          <span className="text-slate-500 font-medium block mt-0.5">{f.cargo} • {f.registroProfissional}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block">Unidade de Lotação:</span>
                          <span className="font-bold text-slate-700 block">{u ? u.nome : 'Sem unidade'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: OUVIDORIA ==================== */}
        {secTab === 'ouvidoria' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Gerenciador da Ouvidoria SUS</h1>
              <p className="text-sm text-slate-500">Analise elogios, sugestões e responda às reclamações dos cidadãos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
              {/* Tickets list */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">
                  Chamados Protocolados
                </div>
                <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                  {tickets.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => setActiveTicket(t)}
                      className={`p-4 hover:bg-slate-50 transition cursor-pointer flex justify-between items-center ${activeTicket?.id === t.id ? 'bg-sky-50' : ''}`}
                    >
                      <div className="space-y-1">
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border ${t.tipo === 'elogio' ? 'bg-green-50 text-green-700 border-green-200' : t.tipo === 'reclamacao' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {t.tipo}
                        </span>
                        <h4 className="font-bold text-slate-950 text-sm leading-snug">{t.assunto}</h4>
                        <p className="text-slate-500 leading-tight line-clamp-1">{t.mensagem}</p>
                        <p className="text-[10px] text-slate-400">Protocolo: <strong>{t.protocolo}</strong> • {new Date(t.dataCriacao).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${t.status === 'novo' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {t.status === 'novo' ? 'Pendente' : 'Respondido'}
                      </span>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p className="p-8 text-center text-slate-400">Nenhuma manifestação encontrada na Ouvidoria.</p>
                  )}
                </div>
              </div>

              {/* Active Ticket details & Reply form */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 h-fit">
                {activeTicket ? (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Detalhes do Protocolo</span>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">{activeTicket.assunto}</h4>
                      <p className="text-[10px] text-slate-400">Paciente: <strong>{activeTicket.pacienteNome}</strong> ({activeTicket.pacienteEmail})</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200/60 leading-relaxed text-slate-600 italic">
                      "{activeTicket.mensagem}"
                    </div>

                    {activeTicket.status === 'respondido' ? (
                      <div className="space-y-2 bg-emerald-50 border border-emerald-200 p-3 rounded">
                        <span className="font-bold text-emerald-800 block text-[10px] uppercase">Resposta Enviada:</span>
                        <p className="text-emerald-900 italic">"{activeTicket.resposta}"</p>
                      </div>
                    ) : (
                      <form onSubmit={handleReplyTicket} className="space-y-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block">Escrever Resposta Oficial</label>
                          <textarea 
                            rows={4}
                            placeholder="Redija um parecer oficial a ser enviado ao e-mail do cidadão..."
                            value={ticketReply}
                            onChange={(e) => setTicketReply(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" /> Enviar Resposta
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-medium">Selecione uma manifestação ao lado para analisar e responder.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: AUDITORIA ==================== */}
        {secTab === 'auditoria' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Logs de Auditoria do Sistema</h1>
              <p className="text-sm text-slate-500">Rastreabilidade completa em conformidade com as diretrizes da LGPD.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm">Histórico Completo de Alterações de Banco de Dados</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Data/Hora</th>
                      <th className="p-4">Responsável</th>
                      <th className="p-4">Ação / Evento</th>
                      <th className="p-4">Tabela Afetada</th>
                      <th className="p-4">Registro ID</th>
                      <th className="p-4">Endereço IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(log.dataHora).toLocaleString('pt-BR')}</td>
                        <td className="p-4 font-bold text-slate-800">{log.usuarioId}</td>
                        <td className="p-4 text-slate-900 font-semibold">{log.acao}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold border border-slate-200/50">
                            {log.tabelaAfetada}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-500">{log.registroId}</td>
                        <td className="p-4 text-slate-500 font-mono">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
