/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  MapPin, 
  UserPlus, 
  CheckCircle, 
  Users, 
  FileSpreadsheet, 
  Plus, 
  AlertCircle, 
  Smile, 
  Calendar 
} from 'lucide-react';
import { MockDb } from '../db/mockDb';
import { Paciente, VisitaDomiciliar, TipoVisita } from '../types';

interface AgenteSaudePanelProps {
  onLogout: () => void;
  usuarioNome: string;
}

export default function AgenteSaudePanel({ onLogout, usuarioNome }: AgenteSaudePanelProps) {
  const [acsTab, setAcsTab] = useState<'familias' | 'visita' | 'historico'>('familias');
  
  // DB States
  const [pacientes, setPacientes] = useState(() => MockDb.getPacientes().filter(p => p.agenteSaudeId === 'ag-1'));
  const [visitas, setVisitas] = useState<VisitaDomiciliar[]>(() => MockDb.getVisitasDomiciliares());

  // Form New Visit
  const [selectedPacienteId, setSelectedPacienteId] = useState(pacientes[0]?.id || '');
  const [tipoVisita, setTipoVisita] = useState<TipoVisita>('hipertenso');
  const [pressaoAferida, setPressaoAferida] = useState('120/80');
  const [glicemiaAferida, setGlicemiaAferida] = useState(90);
  const [sintomasRelatados, setSintomasRelatados] = useState('');
  const [acoesRealizadas, setAcoesRealizadas] = useState('Verificação de vacinas e orientações sobre água tratada.');
  const [observacoes, setObservacoes] = useState('');

  const [visitaSucesso, setVisitaSucesso] = useState(false);

  // Registering household visit
  const handleSaveVisita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPacienteId) return;

    const pac = pacientes.find(p => p.id === selectedPacienteId);
    if (!pac) return;

    const newVisita: VisitaDomiciliar = {
      id: `vis-${Date.now()}`,
      pacienteId: pac.id,
      pacienteNome: pac.nome,
      agenteId: 'ag-1',
      tipoVisita,
      dataVisita: new Date().toISOString().split('T')[0],
      pressaoAferida: (tipoVisita === 'hipertenso' || tipoVisita === 'gestante') ? pressaoAferida : undefined,
      glicemiaAferida: tipoVisita === 'diabetico' ? glicemiaAferida : undefined,
      sintomasRelatados,
      acoesRealizadas,
      observacoes,
      status: 'concluido'
    };

    MockDb.addVisitaDomiciliar(newVisita);
    setVisitas(MockDb.getVisitasDomiciliares());

    // Reset Form
    setSintomasRelatados('');
    setObservacoes('');
    setVisitaSucesso(true);
    setAcsTab('historico');
    setTimeout(() => setVisitaSucesso(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row" id="agente-saude-panel-container">
      {/* Sidebar ACS */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded border border-blue-500/30">
              Agente Comunitário de Saúde
            </span>
            <h2 className="text-white text-base font-black">Marcos Oliveira</h2>
            <p className="text-xs text-slate-400">Microárea: <strong>Setor Oásis (Zona 04)</strong></p>
          </div>

          <nav className="flex flex-col gap-1.5 text-sm font-medium">
            <button
              onClick={() => setAcsTab('familias')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${acsTab === 'familias' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Users className="w-4 h-4" />
              Famílias sob Cobertura
              <span className="ml-auto bg-slate-800 text-slate-400 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-slate-700">
                {pacientes.length}
              </span>
            </button>
            <button
              onClick={() => setAcsTab('visita')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${acsTab === 'visita' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Home className="w-4 h-4" />
              Lançar Visita Domiciliar
            </button>
            <button
              onClick={() => setAcsTab('historico')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${acsTab === 'historico' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Relatório de Visitas
              {visitas.length > 0 && (
                <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/30">
                  {visitas.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
        >
          Sair do Aplicativo
        </button>
      </aside>

      {/* Main clinical space */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        {/* ==================== SUB-TAB: COBERTURA ==================== */}
        {acsTab === 'familias' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Famílias Cadastradas no Setor</h1>
              <p className="text-sm text-slate-500">Mapeamento territorial da microárea sob responsabilidade deste agente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
              {pacientes.map(p => (
                <div key={p.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-base">{p.nome}</h4>
                      <p className="text-slate-400 mt-0.5">SUS: {p.cartaoSus}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600 font-medium">
                    <div className="flex justify-between">
                      <span>Endereço:</span>
                      <span className="font-bold text-slate-800">{p.endereco}, {p.numero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contato:</span>
                      <span className="font-bold text-slate-800">{p.telefone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grupo Alvo:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.doencasCronicas.includes('Diabetes') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {p.doencasCronicas}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: LANÇAR VISITA ==================== */}
        {acsTab === 'visita' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Registrar Visita Domiciliar</h1>
              <p className="text-sm text-slate-500">Insira as informações coletadas durante a visita presencial às moradias.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-3xl">
              <form onSubmit={handleSaveVisita} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Cidadão Visitado</label>
                    <select 
                      value={selectedPacienteId}
                      onChange={(e) => setSelectedPacienteId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      {pacientes.map(p => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tipo / Foco da Visita</label>
                    <select 
                      value={tipoVisita}
                      onChange={(e: any) => setTipoVisita(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="gestante">Acompanhamento de Gestante</option>
                      <option value="puerpera">Acompanhamento de Pós-parto</option>
                      <option value="recem_nascido">Recém-nascido</option>
                      <option value="diabetico">Acompanhamento de Diabético</option>
                      <option value="hipertenso">Acompanhamento de Hipertenso</option>
                      <option value="vacinas_atrasadas">Carteira de Vacina Atrasada</option>
                      <option value="visita_geral">Visita Geral e Orientação</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(tipoVisita === 'hipertenso' || tipoVisita === 'gestante') && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="font-bold text-slate-700">Pressão Arterial Coletada</label>
                      <input 
                        type="text" 
                        value={pressaoAferida}
                        onChange={(e) => setPressaoAferida(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                  )}

                  {tipoVisita === 'diabetico' && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="font-bold text-slate-700">HGT Glicemia Aferida (mg/dL)</label>
                      <input 
                        type="number" 
                        value={glicemiaAferida}
                        onChange={(e) => setGlicemiaAferida(parseInt(e.target.value) || 90)}
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ações Realizadas e Orientações Fornecidas</label>
                  <textarea 
                    rows={2}
                    value={acoesRealizadas}
                    onChange={(e) => setAcoesRealizadas(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Queixas de Saúde ou Sintomas Relatados</label>
                  <textarea 
                    rows={2}
                    placeholder="Febre, tosse, dor de cabeça, etc."
                    value={sintomasRelatados}
                    onChange={(e) => setSintomasRelatados(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Observações Extras de Moradia/Saneamento</label>
                  <textarea 
                    rows={2}
                    placeholder="Ex: Quintal com água parada de chuva, orientado limpeza imediata..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition cursor-pointer"
                >
                  Gravar Registro de Visita
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: HISTORICO DE VISITAS ==================== */}
        {acsTab === 'historico' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Histórico de Visitas do Agente</h1>
              <p className="text-sm text-slate-500">Histórico cronológico de visitas registradas por você para controle territorial.</p>
            </div>

            {visitaSucesso && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg font-bold mb-4">
                ✓ Visita cadastrada com sucesso e gravada nos relatórios!
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Cidadão Visitado</th>
                      <th className="p-4">Foco / Tipo</th>
                      <th className="p-4">Data</th>
                      <th className="p-4">Lançamentos Clínicos</th>
                      <th className="p-4">Ações Realizadas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {visitas.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-950 text-sm">{v.pacienteNome}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200/50 uppercase text-[9px]">
                            {v.tipoVisita}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{new Date(v.dataVisita).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4 leading-relaxed">
                          {v.pressaoAferida && <span className="block text-slate-600">PA: <strong>{v.pressaoAferida}</strong> mmHg</span>}
                          {v.glicemiaAferida && <span className="block text-slate-600">Glicemia: <strong>{v.glicemiaAferida}</strong> mg/dL</span>}
                          {v.sintomasRelatados ? (
                            <span className="block text-red-700">Queixa: {v.sintomasRelatados}</span>
                          ) : (
                            <span className="block text-slate-400 font-normal">Sem sintomas queixados</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 font-normal leading-normal">{v.acoesRealizadas}</td>
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
