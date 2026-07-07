/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  Newspaper, 
  MapPin, 
  Pill, 
  CalendarDays, 
  ShieldAlert, 
  FileText, 
  MessageSquare, 
  Volume2, 
  ArrowRight, 
  Clock, 
  Phone, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  PlusCircle, 
  HeartHandshake 
} from 'lucide-react';
import { MockDb } from '../db/mockDb';
import { Noticia, Campanha, UnidadeSaude, Medicamento, OuvidoriaTicket } from '../types';
import Logo from './Logo';

interface PortalPublicoProps {
  onNavigateToLogin: (perfilPreset?: string) => void;
}

type TabPublica = 'inicio' | 'noticias' | 'unidades' | 'medicamentos' | 'campanhas' | 'transparencia' | 'ouvidoria';

export default function PortalPublico({ onNavigateToLogin }: PortalPublicoProps) {
  const [activeTab, setActiveTab] = useState<TabPublica>('inicio');
  
  // States for search and forms
  const [searchMed, setSearchMed] = useState('');
  const [searchUnit, setSearchUnit] = useState('');
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);
  
  // Ouvidoria Form
  const [ouvNome, setOuvNome] = useState('');
  const [ouvEmail, setOuvEmail] = useState('');
  const [ouvTipo, setOuvTipo] = useState<'reclamacao' | 'sugestao' | 'elogio' | 'solicitacao'>('sugestao');
  const [ouvAssunto, setOuvAssunto] = useState('');
  const [ouvMensagem, setOuvMensagem] = useState('');
  const [ouvSuccess, setOuvSuccess] = useState('');

  // Fetch DB records
  const noticias = MockDb.getNoticias().filter(n => n.publicado);
  const campanhas = MockDb.getCampanhas();
  const unidades = MockDb.getUnidadesSaude();
  const medicamentos = MockDb.getMedicamentos();
  const estoque = MockDb.getEstoqueMedicamentos();
  const agendamentos = MockDb.getAgendamentos();

  // Filter lists
  const filteredMedicamentos = medicamentos.filter(m => 
    m.nome.toLowerCase().includes(searchMed.toLowerCase()) || 
    m.principioAtivo.toLowerCase().includes(searchMed.toLowerCase()) ||
    m.categoria.toLowerCase().includes(searchMed.toLowerCase())
  );

  const filteredUnidades = unidades.filter(u => 
    u.nome.toLowerCase().includes(searchUnit.toLowerCase()) || 
    u.tipoUnidade.toLowerCase().includes(searchUnit.toLowerCase()) ||
    u.endereco.toLowerCase().includes(searchUnit.toLowerCase())
  );

  // Submit Ouvidoria
  const handleSubmitOuvidoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ouvAssunto || !ouvMensagem) {
      alert('Por favor, preencha o assunto e a mensagem.');
      return;
    }
    const protocolo = `OUV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket: OuvidoriaTicket = {
      id: `t-${Date.now()}`,
      municipioId: 'mun-1',
      pacienteNome: ouvNome || 'Anônimo',
      pacienteEmail: ouvEmail || 'não fornecido',
      tipo: ouvTipo,
      assunto: ouvAssunto,
      mensagem: ouvMensagem,
      protocolo,
      status: 'novo',
      dataCriacao: new Date().toISOString()
    };
    MockDb.addOuvidoria(newTicket);
    setOuvSuccess(protocolo);
    // Clear form
    setOuvNome('');
    setOuvEmail('');
    setOuvAssunto('');
    setOuvMensagem('');
  };

  // Indicators
  const waitTimes = {
    medico: '25 min',
    dentista: '30 min',
    enfermagem: '10 min'
  };

  return (
    <div id="portal-publico" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Upper Alerta / Urgência Bar */}
      <div className="bg-amber-500 text-slate-950 font-medium py-2 px-4 text-xs sm:text-sm flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <ShieldAlert className="w-5 h-5 animate-pulse text-amber-950 shrink-0" />
          <span>
            <strong>Aviso Urgente:</strong> Vacinação contra a Dengue liberada para crianças e adolescentes de 10 a 14 anos na UBS Central. Leve o cartão SUS!
          </span>
        </div>
      </div>

      {/* Main Header / Portal Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('inicio')}>
            <Logo iconOnly={true} />
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 leading-tight">Secretaria de Saúde</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-sm font-medium">
            <button 
              id="nav-btn-inicio"
              onClick={() => setActiveTab('inicio')}
              className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'inicio' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Início
            </button>
            <button 
              id="nav-btn-noticias"
              onClick={() => setActiveTab('noticias')}
              className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'noticias' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Notícias
            </button>
            <button 
              id="nav-btn-unidades"
              onClick={() => setActiveTab('unidades')}
              className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'unidades' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Unidades
            </button>
            <button 
              id="nav-btn-medicamentos"
              onClick={() => setActiveTab('medicamentos')}
              className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'medicamentos' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Medicamentos
            </button>
            <button 
              id="nav-btn-campanhas"
              onClick={() => setActiveTab('campanhas')}
              className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'campanhas' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Campanhas
            </button>
            <button 
              id="nav-btn-transparencia"
              onClick={() => setActiveTab('transparencia')}
              className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'transparencia' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Transparência
            </button>
            <button 
              id="nav-btn-ouvidoria"
              onClick={() => setActiveTab('ouvidoria')}
              className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'ouvidoria' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Ouvidoria
            </button>
          </nav>

          {/* Citizen & Internal Login Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="login-btn-paciente"
              onClick={() => onNavigateToLogin('paciente')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              Área do Paciente
            </button>
            <button
              id="login-btn-interno"
              onClick={() => onNavigateToLogin()}
              className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition border border-slate-200"
            >
              Acesso Restrito
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:py-8 w-full">
        {/* ======================= TAB: INICIO ======================= */}
        {activeTab === 'inicio' && (
          <div className="space-y-8 animate-fade-in" id="portal-inicio">
            {/* Hero Section Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 sm:p-12 text-white relative overflow-hidden shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-block bg-blue-500/20 text-blue-400 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/30">
                  Saúde Digital do Município
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Sua saúde em um <span className="text-blue-400">único portal</span> conectado.
                </h1>
                <p className="text-slate-300 text-base sm:text-lg max-w-xl">
                  Seja bem-vindo ao novo portal da prefeitura. Aqui você pode conferir campanhas de vacinação, a lista de remédios nas farmácias, unidades de saúde mais próximas e agendar suas consultas na área de atendimento ao cidadão.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    onClick={() => onNavigateToLogin('paciente')}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold rounded-lg transition flex items-center gap-2 cursor-pointer text-sm"
                  >
                    Agendar Consultas <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('unidades')}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition border border-slate-700 text-sm"
                  >
                    Encontrar Postos
                  </button>
                </div>
              </div>
              
              {/* Custom interactive visual showcasing the municipal healthcare overview */}
              <div className="relative bg-slate-800/60 p-6 rounded-xl border border-slate-700 w-full md:w-80 backdrop-blur-sm shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <Logo iconOnly={true} />
                  <div>
                    <p className="text-xs text-blue-400">Dados do Dia em Tempo Real</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-xl font-black text-blue-400">{unidades.length}</span>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Unidades</p>
                  </div>
                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-xl font-black text-green-400">{agendamentos.filter(a => a.status === 'atendido').length + 42}</span>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Atendidos Hoje</p>
                  </div>
                </div>
                <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-400 font-semibold block mb-1">Média de Espera (Triagem):</span>
                  <div className="flex justify-between">
                    <span>Clínico Geral:</span>
                    <span className="text-green-400 font-bold">{waitTimes.medico}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Odontologia:</span>
                    <span className="text-green-400 font-bold">{waitTimes.dentista}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Access Grid (Bento cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => onNavigateToLogin('paciente')}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group space-y-4"
              >
                <div className="bg-blue-100 text-blue-700 p-3 rounded-lg w-fit">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition">Agendar Consulta</h3>
                  <p className="text-xs text-slate-500 mt-1">Marque atendimento médico, odontológico ou de enfermagem de acordo com seu bairro.</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-2">
                  Acessar área do cidadão <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('medicamentos')}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group space-y-4"
              >
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-lg w-fit">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition">Estoque de Remédios</h3>
                  <p className="text-xs text-slate-500 mt-1">Veja se os medicamentos prescritos estão disponíveis para retirada na Farmácia Municipal.</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
                  Pesquisar medicamentos <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('unidades')}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group space-y-4"
              >
                <div className="bg-blue-100 text-blue-700 p-3 rounded-lg w-fit">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition">Unidades de Saúde</h3>
                  <p className="text-xs text-slate-500 mt-1">Consulte endereços, horários de postos, UBS, ESF e profissionais ativos.</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-2">
                  Ver postos ativos <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('ouvidoria')}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group space-y-4"
              >
                <div className="bg-amber-100 text-amber-700 p-3 rounded-lg w-fit">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-amber-700 transition">Ouvidoria Municipal</h3>
                  <p className="text-xs text-slate-500 mt-1">Deixe reclamações, sugestões ou elogios para nossa Ouvidoria da Saúde.</p>
                </div>
                <span className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-2">
                  Registrar manifestação <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Noticias & Campanhas Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* News list (2/3 width on desktop) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-600" />
                    Últimas Notícias e Campanhas
                  </h2>
                  <button 
                    onClick={() => setActiveTab('noticias')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Ver todas notícias
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {noticias.slice(0, 2).map(n => (
                    <div 
                      key={n.id} 
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow transition flex flex-col"
                    >
                      <img 
                        src={n.imagem} 
                        alt={n.titulo} 
                        className="h-40 w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-200/50 w-fit block">
                            {n.categoria}
                          </span>
                          <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedNoticia(n)}>
                            {n.titulo}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {n.resumo}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                          <span>{new Date(n.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                          <button 
                            onClick={() => setSelectedNoticia(n)}
                            className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                          >
                            Ler mais <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Active Drives / Campaigns (1/3 width) */}
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-red-500" />
                    Campanhas Ativas
                  </h2>
                </div>

                <div className="space-y-4">
                  {campanhas.filter(c => c.status === 'ativa').map(c => (
                    <div 
                      key={c.id}
                      className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-sm relative overflow-hidden"
                    >
                      <div className="relative z-10 space-y-2">
                        <span className="inline-block bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Destaque
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                          {c.titulo}
                        </h3>
                        <p className="text-xs text-slate-600">
                          {c.descricao}
                        </p>
                        <div className="text-[11px] font-semibold text-red-700 bg-red-100/60 p-2 rounded border border-red-200/50 w-fit flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Período: {new Date(c.dataInicio).toLocaleDateString('pt-BR')} a {new Date(c.dataFim).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Small general info card about health care hours */}
                  <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3">
                    <h4 className="font-bold text-sm flex items-center gap-2 text-blue-400">
                      <Clock className="w-4 h-4" /> Atendimento de Plantão
                    </h4>
                    <p className="text-xs text-slate-300">
                      Urgências e Emergências médicas e odontológicas devem se dirigir ao Pronto Atendimento Municipal (PAM), com funcionamento 24 horas por dia.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                      <Phone className="w-4 h-4 text-blue-400" /> (44) 192 (SAMU)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: NOTICIAS ======================= */}
        {activeTab === 'noticias' && (
          <div className="space-y-6 animate-fade-in" id="portal-noticias">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-black text-slate-900">Mural de Notícias e Editais</h2>
              <p className="text-sm text-slate-500">Acompanhe as ações da Secretaria Municipal de Saúde, editais públicos e avisos importantes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {noticias.map(n => (
                <div key={n.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <img src={n.imagem} alt={n.titulo} className="h-48 w-full object-cover" referrerPolicy="no-referrer" />
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <span className="inline-block bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {n.categoria}
                      </span>
                      <h3 className="font-extrabold text-slate-900 leading-snug line-clamp-2 text-base">
                        {n.titulo}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3">
                        {n.resumo}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-400">{new Date(n.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                      <button 
                        onClick={() => setSelectedNoticia(n)}
                        className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                      >
                        Ler notícia completa <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB: UNIDADES ======================= */}
        {activeTab === 'unidades' && (
          <div className="space-y-6 animate-fade-in" id="portal-unidades">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Unidades de Saúde Ativas</h2>
                <p className="text-sm text-slate-500">Encontre o posto de saúde, UBS, ESF ou farmácia que atende o seu bairro de residência.</p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Buscar unidade por nome, tipo..." 
                  value={searchUnit}
                  onChange={(e) => setSearchUnit(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUnidades.map(u => (
                <div key={u.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                        {u.tipoUnidade}
                      </span>
                      <h3 className="font-extrabold text-slate-950 text-base sm:text-lg mt-1.5 leading-snug">
                        {u.nome}
                      </h3>
                    </div>
                    <div className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      Disponível
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{u.endereco}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Horário: {u.horarioFuncionamento}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Telefone: {u.telefone}</span>
                    </div>
                  </div>

                  {/* Served neighborhoods info */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">Bairros de Referência Atendidos:</span>
                    <span className="text-slate-600">
                      {MockDb.getBairros().filter(b => b.unidadeResponsavelId === u.id).map(b => b.nome).join(', ') || 'Todo o município'}
                    </span>
                  </div>

                  {/* Active staff count */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-400">
                    <span>Equipe Profissional:</span>
                    <span className="font-bold text-slate-700">
                      {MockDb.getFuncionarios().filter(f => f.unidadeId === u.id).length} servidores ativos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB: MEDICAMENTOS ======================= */}
        {activeTab === 'medicamentos' && (
          <div className="space-y-6 animate-fade-in" id="portal-medicamentos">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Relação de Medicamentos (REMUME)</h2>
                <p className="text-sm text-slate-500">Consulte de forma transparente a disponibilidade de remédios na rede municipal de saúde.</p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Pesquise por Dipirona, Losartana..." 
                  value={searchMed}
                  onChange={(e) => setSearchMed(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Explanatory banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-blue-800 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold">Como retirar medicamentos nas farmácias municipais?</strong>
                <p>É obrigatória a apresentação do <strong>Cartão SUS do município</strong>, <strong>Documento de Identidade oficial</strong>, e a <strong>Receita médica original</strong> (ou emitida via sistema do SUS) dentro do prazo de validade indicado pelo profissional.</p>
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Medicamento</th>
                      <th className="p-4">Princípio Ativo</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Dosagem / Forma</th>
                      <th className="p-4">Disponibilidade na Farmácia Central</th>
                      <th className="p-4 text-center">Via SUS</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {filteredMedicamentos.map(m => {
                      const estItem = estoque.find(e => e.medicamentoId === m.id);
                      const isDisponivel = estItem ? estItem.quantidade > 0 : false;
                      const qtd = estItem ? estItem.quantidade : 0;
                      
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-bold text-slate-900">{m.nome}</td>
                          <td className="p-4 text-xs font-mono text-slate-600">{m.principioAtivo}</td>
                          <td className="p-4 text-xs">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                              {m.categoria}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-600">{m.dosagem} — {m.forma}</td>
                          <td className="p-4">
                            {isDisponivel ? (
                              <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                <span>Disponível ({qtd} un.)</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                <span>Indisponível / Em Falta</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {m.nome.includes('Controlado') ? (
                              <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded">
                                Receita Controlada
                              </span>
                            ) : (
                              <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 font-bold px-2 py-0.5 rounded">
                                Dispensação Comum
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMedicamentos.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Nenhum medicamento encontrado para os termos pesquisados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: CAMPANHAS ======================= */}
        {activeTab === 'campanhas' && (
          <div className="space-y-6 animate-fade-in" id="portal-campanhas">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-black text-slate-900">Campanhas Municipais de Saúde</h2>
              <p className="text-sm text-slate-500">Confira as campanhas vigentes, vacinações extraordinárias e ações de prevenção epidemiológica.</p>
            </div>

            <div className="space-y-6">
              {campanhas.map(c => (
                <div 
                  key={c.id} 
                  className={`bg-white rounded-xl border p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between ${c.status === 'ativa' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'}`}
                >
                  <img 
                    src={c.imagem} 
                    alt={c.titulo} 
                    className="w-full md:w-48 h-32 rounded-lg object-cover shadow-inner shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${c.status === 'ativa' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-slate-100 text-slate-600 border border-slate-300'}`}>
                        {c.status === 'ativa' ? 'Campanha em Andamento' : 'Planejada / Próxima'}
                      </span>
                      {c.unidadeId && (
                        <span className="text-xs text-slate-400">Sede: UBS Central</span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                      {c.titulo}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {c.descricao}
                    </p>
                    <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200/60 w-fit flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Vigência: de {new Date(c.dataInicio).toLocaleDateString('pt-BR')} até {new Date(c.dataFim).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="shrink-0 pt-4 md:pt-0 w-full md:w-auto">
                    <button 
                      onClick={() => onNavigateToLogin('paciente')}
                      className={`w-full px-5 py-2.5 text-xs font-bold rounded-lg transition ${c.status === 'ativa' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                    >
                      {c.status === 'ativa' ? 'Ver Postos & Participar' : 'Mais Informações'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB: TRANSPARENCIA ======================= */}
        {activeTab === 'transparencia' && (
          <div className="space-y-6 animate-fade-in" id="portal-transparencia">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-black text-slate-900">Portal de Transparência da Saúde</h2>
              <p className="text-sm text-slate-500">Dados abertos, estatísticas reais e indicadores de atendimento para controle social do SUS municipal.</p>
            </div>

            {/* General dynamic counters block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Consultas Realizadas</span>
                <span className="text-3xl font-black text-slate-950 block">4.921</span>
                <p className="text-[10px] text-green-600 font-semibold">+12% em relação ao mês anterior</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Atendimentos Odontológicos</span>
                <span className="text-3xl font-black text-slate-950 block">1.844</span>
                <p className="text-[10px] text-blue-600 font-semibold">Tártaro, limpezas e obturações via SUS</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Média de Espera (Clínico)</span>
                <span className="text-3xl font-black text-slate-950 block">22 min</span>
                <p className="text-[10px] text-green-600 font-semibold">Considerando triagem de risco de hoje</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Vacinas Aplicadas (2026)</span>
                <span className="text-3xl font-black text-slate-950 block">12.510</span>
                <p className="text-[10px] text-amber-600 font-semibold">Meta de imunização em 88% concluída</p>
              </div>
            </div>

            {/* Detailed table of queues per specialty */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Meta de Abastecimento da Farmácia Municipal
                </h3>
                <p className="text-xs text-slate-500">Monitore em tempo real o índice de abastecimento de medicamentos essenciais da atenção básica na cidade.</p>
                
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Analgésicos e Antitérmicos (Dipirona, Paracetamol)</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Hipertensão e Diabetes (Metformina, Losartana)</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Antibióticos Básicos (Amoxicilina)</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Fila de Espera de Especialidades Regulação SUS
                </h3>
                <p className="text-xs text-slate-500">Estimativas de encaminhamentos ativos autorizados pelo SISREG (Sistema de Regulação) aguardando vaga estadual.</p>
                
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Cardiologia</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Tempo estimado: 45 dias</span>
                      <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded font-bold">12 pessoas</span>
                    </div>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Ortopedia</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Tempo estimado: 30 dias</span>
                      <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded font-bold">8 pessoas</span>
                    </div>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Oftalmologia</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Tempo estimado: 60 dias</span>
                      <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">24 pessoas</span>
                    </div>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Odontopediatria Avançada</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Tempo estimado: 15 dias</span>
                      <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded font-bold">3 pessoas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: OUVIDORIA ======================= */}
        {activeTab === 'ouvidoria' && (
          <div className="space-y-6 animate-fade-in" id="portal-ouvidoria">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-black text-slate-900">Ouvidoria Geral do SUS</h2>
              <p className="text-sm text-slate-500">Deixe seu elogio, sugestão, reclamação ou solicitação. Garantimos retorno oficial a todas as manifestações.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar stats info */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-slate-900">Como funciona?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ao preencher e enviar o formulário ao lado, um número de protocolo único será gerado imediatamente.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  As manifestações são triadas pela Ouvidoria Geral da Saúde de Santa Esperança. O prazo de resposta padrão é de até 15 dias úteis, disponível para acompanhamento pela Secretaria.
                </p>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <span>Sua manifestação pode ser anônima. Caso queira retorno oficial com resposta no e-mail, favor fornecer um e-mail válido.</span>
                </div>
              </div>

              {/* Form panel */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {ouvSuccess ? (
                  <div className="text-center p-8 space-y-4">
                    <div className="bg-green-100 text-green-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-3xl font-bold border border-green-200">
                      ✓
                    </div>
                    <h3 className="text-xl font-bold text-slate-950">Manifestação Registrada!</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Sua manifestação foi inserida com sucesso em nossa central de Ouvidoria Municipal. Anote o número do seu protocolo para consulta:
                    </p>
                    <div className="bg-slate-100 p-3 rounded font-mono font-bold text-blue-700 text-lg border border-slate-200 w-fit mx-auto select-all">
                      {ouvSuccess}
                    </div>
                    <p className="text-xs text-slate-400">Você receberá atualizações sobre a resposta assim que analisado pela coordenação.</p>
                    <button 
                      onClick={() => setOuvSuccess('')}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                    >
                      Enviar Nova Manifestação
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOuvidoria} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Seu Nome (Opcional)</label>
                        <input 
                          type="text" 
                          placeholder="Digite seu nome ou deixe em branco" 
                          value={ouvNome}
                          onChange={(e) => setOuvNome(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Seu E-mail (Opcional)</label>
                        <input 
                          type="email" 
                          placeholder="exemplo@email.com" 
                          value={ouvEmail}
                          onChange={(e) => setOuvEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tipo de Manifestação</label>
                        <select 
                          value={ouvTipo}
                          onChange={(e: any) => setOuvTipo(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                        >
                          <option value="sugestao">Sugestão</option>
                          <option value="elogio">Elogio</option>
                          <option value="reclamacao">Reclamação</option>
                          <option value="solicitacao">Solicitação / Pedido</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Assunto</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Tempo de espera na UBS Centro" 
                          value={ouvAssunto}
                          onChange={(e) => setOuvAssunto(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Mensagem Detalhada</label>
                      <textarea 
                        rows={5}
                        placeholder="Descreva o ocorrido com datas, nomes, locais se possível, para que possamos investigar e aprimorar nosso serviço." 
                        value={ouvMensagem}
                        onChange={(e) => setOuvMensagem(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm w-full sm:w-auto transition shadow-sm cursor-pointer"
                    >
                      Protocolar Manifestação
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2">
            <Logo iconOnly={true} />
            <span className="font-extrabold text-white text-base">SaaS Municipal de Saúde</span>
          </div>
          <p>© 2026 Prefeitura Municipal de Santa Esperança. Todos os direitos reservados. Conectado ao Sistema de Regulação do SUS.</p>
          <p className="text-slate-600">Desenvolvido como protótipo de alta fidelidade para modernização e digitalização da saúde municipal.</p>
        </div>
      </footer>

      {/* Noticia Dialog Modal */}
      {selectedNoticia && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-fade-in flex flex-col max-h-[90vh]">
            <div className="relative">
              <img 
                src={selectedNoticia.imagem} 
                alt={selectedNoticia.titulo} 
                className="w-full h-56 object-cover" 
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setSelectedNoticia(null)}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                  {selectedNoticia.categoria}
                </span>
                <span className="text-xs text-slate-400 font-medium">Publicado em: {new Date(selectedNoticia.dataPublicacao).toLocaleDateString('pt-BR')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight">
                {selectedNoticia.titulo}
              </h3>
              <p className="text-sm font-semibold text-slate-700 italic border-l-4 border-blue-500 pl-3 bg-slate-50 py-1.5 rounded-r">
                {selectedNoticia.resumo}
              </p>
              <div className="text-sm text-slate-600 leading-relaxed space-y-3 pt-2">
                {selectedNoticia.conteudo.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedNoticia(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs"
              >
                Fechar Artigo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
