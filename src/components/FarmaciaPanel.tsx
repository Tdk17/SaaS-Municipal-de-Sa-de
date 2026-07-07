/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  FileText, 
  CheckCircle, 
  Plus, 
  ShieldCheck, 
  User, 
  Inbox, 
  AlertCircle 
} from 'lucide-react';
import { MockDb } from '../db/mockDb';
import { Medicamento, Receita, Paciente } from '../types';

export interface MedicamentoDisponivel {
  id: string;
  nome: string;
  principioAtivo: string;
  dosagem: string;
  categoria: string;
  quantidadeDisponivel: number;
  lote: string;
}

interface FarmaciaPanelProps {
  onLogout: () => void;
  usuarioNome: string;
}

const getMedsWithEstoque = (): MedicamentoDisponivel[] => {
  const meds = MockDb.getMedicamentos();
  const ests = MockDb.getEstoqueMedicamentos();
  return meds.map(m => {
    const est = ests.find(e => e.medicamentoId === m.id);
    return {
      id: m.id,
      nome: m.nome,
      principioAtivo: m.principioAtivo,
      dosagem: m.dosagem,
      categoria: m.categoria,
      quantidadeDisponivel: est ? est.quantidade : 0,
      lote: est ? est.lote : 'L-PADRAO'
    };
  });
};

export default function FarmaciaPanel({ onLogout, usuarioNome }: FarmaciaPanelProps) {
  const [farTab, setFarTab] = useState<'estoque' | 'receitas' | 'historico'>('receitas');
  
  // DB States
  const [medicamentos, setMedicamentos] = useState<MedicamentoDisponivel[]>(() => getMedsWithEstoque());
  const [receitas, setReceitas] = useState<Receita[]>(() => MockDb.getReceitas());
  const [pacientes] = useState<Paciente[]>(() => MockDb.getPacientes());

  // Search
  const [searchPresc, setSearchPresc] = useState('');

  // Form Lote Entry
  const [selectedMedId, setSelectedMedId] = useState(getMedsWithEstoque()[0]?.id || '');
  const [addQty, setAddQty] = useState(100);
  const [loteCod, setLoteCod] = useState('L-2026A');
  const [loteSuccess, setLoteSuccess] = useState(false);

  const [dispensationSuccess, setDispensationSuccess] = useState(false);

  // Dispensar medicamento handler (marked as 'entregue', deducts stock if found in stock matching name!)
  const handleDispensePrescription = (receitaId: string) => {
    const rec = receitas.find(r => r.id === receitaId);
    if (!rec) return;

    // Deduct stock for matching medicines if found
    // We can parse or search the prescription medicines text (simple substring match or just deduct from first item for demo)
    const matchedMed = medicamentos.find(m => rec.medicamentos.toLowerCase().includes(m.nome.toLowerCase()));
    if (matchedMed) {
      const currentStock = matchedMed.quantidadeDisponivel;
      const deductedQty = Math.min(currentStock, 30); // Deduct standard pack
      MockDb.atualizarEstoqueMedicamento(matchedMed.id, currentStock - deductedQty);
    }

    // Update status to 'dispensada'
    MockDb.updateReceitaStatus(receitaId, 'dispensada');

    // Sync state
    setReceitas(MockDb.getReceitas());
    setMedicamentos(getMedsWithEstoque());
    
    setDispensationSuccess(true);
    setTimeout(() => setDispensationSuccess(false), 3000);
  };

  // Add stock entry
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId || addQty <= 0) return;

    const med = medicamentos.find(m => m.id === selectedMedId);
    if (!med) return;

    const newQty = med.quantidadeDisponivel + addQty;
    MockDb.atualizarEstoqueMedicamento(selectedMedId, newQty);
    setMedicamentos(getMedsWithEstoque());

    setLoteSuccess(true);
    setAddQty(100);
    setTimeout(() => setLoteSuccess(false), 3000);
  };

  // Filter recipes based on patient search
  const filteredRecipes = receitas.filter(r => {
    const p = pacientes.find(pac => pac.id === r.pacienteId);
    if (!p) return false;
    
    return p.nome.toLowerCase().includes(searchPresc.toLowerCase()) || 
           p.cpf.includes(searchPresc) || 
           r.medicamentos.toLowerCase().includes(searchPresc.toLowerCase());
  });

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row" id="farmacia-panel-container">
      {/* Sidebar Farmácia */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded border border-blue-500/30">
              Farmácia do Município
            </span>
            <h2 className="text-white text-base font-black">Farmácia Central</h2>
            <p className="text-xs text-slate-400">Farmacêutica: <strong>{usuarioNome}</strong></p>
          </div>

          <nav className="flex flex-col gap-1.5 text-sm font-medium">
            <button
              onClick={() => setFarTab('receitas')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${farTab === 'receitas' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <FileText className="w-4 h-4" />
              Prescrições Recebidas
              {receitas.filter(r => r.status === 'ativa').length > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {receitas.filter(r => r.status === 'ativa').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setFarTab('estoque')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${farTab === 'estoque' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <Briefcase className="w-4 h-4" />
              Controle de Estoque
            </button>
            <button
              onClick={() => setFarTab('historico')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${farTab === 'historico' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Logs de Dispensação
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
        {/* ==================== SUB-TAB: RECEITAS / DISPENSAÇÃO ==================== */}
        {farTab === 'receitas' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Consulta de Receitas Digitais</h1>
                <p className="text-sm text-slate-500">Busque receitas digitais ativas do paciente para realizar a dispensação oficial de medicamentos.</p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por Nome, CPF ou Remédio..." 
                  value={searchPresc}
                  onChange={(e) => setSearchPresc(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-xs font-medium"
                />
              </div>
            </div>

            {dispensationSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg font-bold">
                ✓ Medicamento dispensado com sucesso! O estoque municipal foi atualizado automaticamente e a receita foi baixada.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Prescriptions Active List */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-900">
                  Prescrições Pendentes para Entrega
                </div>
                <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                  {filteredRecipes.filter(r => r.status === 'ativa').map(r => {
                    const p = pacientes.find(pac => pac.id === r.pacienteId);
                    if (!p) return null;
                    return (
                      <div key={r.id} className="p-4 hover:bg-slate-50/50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${r.tipoReceita === 'controlada' ? 'bg-red-600' : r.tipoReceita === 'uso_continuo' ? 'bg-teal-600' : 'bg-blue-600'}`}>
                              {r.tipoReceita}
                            </span>
                            <span className="text-slate-400 font-bold">Emissão: {new Date(r.dataEmissao).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-950 text-base">{p.nome}</h4>
                          <p className="text-slate-500 font-medium">CPF: {p.cpf} • Cartão SUS: {p.cartaoSus}</p>
                          
                          <div className="bg-slate-50 p-3 rounded border border-slate-200/50 mt-2 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {r.medicamentos}
                          </div>
                        </div>

                        <div className="shrink-0">
                          <button 
                            onClick={() => handleDispensePrescription(r.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1 text-xs"
                          >
                            <CheckCircle className="w-4 h-4" /> Entregar Medicamentos
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredRecipes.filter(r => r.status === 'ativa').length === 0 && (
                    <div className="p-12 text-center text-slate-400 space-y-2">
                      <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-sm">Nenhuma prescrição pendente encontrada para esta busca.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick stock warning panel */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600 animate-pulse" />
                  Alerta de Estoque Crítico
                </h3>
                <p className="text-slate-400">Verifique os medicamentos com baixas unidades disponíveis para reposição de lote.</p>

                <div className="space-y-3 pt-1">
                  {medicamentos.map(m => (
                    <div key={m.id} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-950 block">{m.nome}</span>
                        <span className="text-[10px] text-slate-400">Lote: {m.loteAtivo}</span>
                      </div>
                      <span className={`px-2 py-1 rounded font-black text-[10px] ${m.quantidadeDisponivel < 100 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'}`}>
                        {m.quantidadeDisponivel} {m.unidadeMedida}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: ESTOQUE ==================== */}
        {farTab === 'estoque' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Entrada de Lote de Medicamento</h1>
              <p className="text-sm text-slate-500">Registre a entrada física de caixas e atualize o inventário da farmácia do município.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form entries */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 h-fit">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Plus className="w-5 h-5 text-blue-600" /> Nova Entrada de Estoque
                </h3>

                {loteSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded font-bold">
                    ✓ Lote de reposição gravado!
                  </div>
                )}

                <form onSubmit={handleAddStock} className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Medicamento</label>
                    <select 
                      value={selectedMedId}
                      onChange={(e) => setSelectedMedId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      {medicamentos.map(m => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Código do Lote</label>
                    <input 
                      type="text" 
                      value={loteCod}
                      onChange={(e) => setLoteCod(e.target.value)}
                      required
                      placeholder="Ex: L-2026B"
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Quantidade Adicional</label>
                    <input 
                      type="number" 
                      value={addQty}
                      onChange={(e) => setAddQty(parseInt(e.target.value) || 0)}
                      required
                      min={1}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm cursor-pointer"
                  >
                    Confirmar Entrada
                  </button>
                </form>
              </div>

              {/* Inventory Table */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Inventário Geral</h3>
                </div>
                <div className="divide-y divide-slate-100 font-sans">
                  {medicamentos.map(m => (
                    <div key={m.id} className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-950 text-sm">{m.nome}</h4>
                        <span className="text-slate-400 mt-0.5">Lote Ativo: <strong>{m.loteAtivo}</strong> • Validade: {m.validade}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-base block text-blue-700">{m.quantidadeDisponivel} {m.unidadeMedida}</span>
                        <span className="text-[10px] text-slate-400 block">{m.requerReceitaControlada ? '★ Controlada' : 'Simples'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB: HISTORICO DISPENSAÇÃO ==================== */}
        {farTab === 'historico' && (
          <div className="space-y-6 text-xs font-sans">
            <div className="border-b border-slate-200 pb-3">
              <h1 className="text-2xl font-black text-slate-900">Histórico de Dispensações</h1>
              <p className="text-sm text-slate-500">Histórico completo de auditoria de medicamentos entregues no município.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Cidadão Recebedor</th>
                      <th className="p-4">Medicamento / Quantidade</th>
                      <th className="p-4">Profissional Prescritor</th>
                      <th className="p-4">Data / Hora Dispensação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {receitas.filter(r => r.status === 'dispensada').map(r => {
                      const p = pacientes.find(pac => pac.id === r.pacienteId);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-bold text-slate-950 text-sm">{p ? p.nome : 'Cidadão'}</td>
                          <td className="p-4 font-mono text-slate-700">{r.medicamentos}</td>
                          <td className="p-4">Profissional ID: {r.profissionalId}</td>
                          <td className="p-4 text-slate-500">Realizado em {new Date(r.dataEmissao).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      );
                    })}
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
