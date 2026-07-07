/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Municipio {
  id: string;
  nome: string;
  estado: string;
  cnpj: string;
  logoUrl?: string;
  corPrincipal: string; // Tailwind hex or class prefix
  dominio: string;
  status: 'ativo' | 'inativo';
  dataCriacao: string;
}

export interface Secretaria {
  id: string;
  municipioId: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  secretarioResponsavel: string;
}

export type TipoUnidade = 
  | 'UBS' 
  | 'ESF' 
  | 'Posto de Saúde' 
  | 'Farmácia Municipal' 
  | 'Unidade Odontológica' 
  | 'Laboratório' 
  | 'Hospital Conveniado';

export interface UnidadeSaude {
  id: string;
  municipioId: string;
  nome: string;
  tipoUnidade: TipoUnidade;
  endereco: string;
  bairroId: string; // Primary neighborhood served
  telefone: string;
  horarioFuncionamento: string;
  latitude?: number;
  longitude?: number;
  status: 'ativo' | 'inativo';
}

export interface Bairro {
  id: string;
  municipioId: string;
  nome: string;
  unidadeResponsavelId: string;
  agenteResponsavelId?: string;
}

export type PerfilUsuario =
  | 'admin_geral'
  | 'admin_unidade'
  | 'medico'
  | 'dentista'
  | 'enfermeiro'
  | 'agente_saude'
  | 'farmacia'
  | 'paciente';

export interface Usuario {
  id: string;
  municipioId: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  perfil: PerfilUsuario;
  status: 'ativo' | 'inativo';
  ultimoAcesso?: string;
}

export interface Funcionario {
  id: string;
  usuarioId: string;
  municipioId: string;
  unidadeId: string;
  nome: string;
  cpf: string;
  cargo: string;
  registroProfissional: string; // CRM, CRO, COREN etc.
  especialidade?: string;
  status: 'ativo' | 'inativo';
}

export interface Medico {
  id: string; // matches funcionarioId or unique
  funcionarioId: string;
  crm: string;
  especialidade: string;
  unidadeId: string;
  bairrosAtendidos: string[]; // ids of Bairros
  diasAtendimento: string[]; // ['Seg', 'Ter', 'Qua']
  horarioInicio: string; // '08:00'
  horarioFim: string; // '17:00'
  status: 'ativo' | 'inativo';
}

export interface Dentista {
  id: string;
  funcionarioId: string;
  cro: string;
  especialidadeOdontologica: string;
  unidadeId: string;
  diasAtendimento: string[];
  horarioInicio: string;
  horarioFim: string;
  status: 'ativo' | 'inativo';
}

export interface AgenteSaude {
  id: string;
  funcionarioId: string;
  unidadeId: string;
  bairrosAtendidos: string[];
  microarea: string;
  status: 'ativo' | 'inativo';
}

export interface Paciente {
  id: string;
  municipioId: string;
  unidadeId: string;
  bairroId: string;
  agenteSaudeId?: string;
  medicoResponsavelId?: string;
  dentistaResponsavelId?: string;
  nome: string;
  cpf: string;
  cartaoSus: string;
  dataNascimento: string;
  sexo: 'M' | 'F' | 'Outro';
  telefone: string;
  email: string;
  endereco: string;
  numero: string;
  complemento?: string;
  cep: string;
  responsavelLegal?: string;
  alergias: string; // text or list representation
  doencasCronicas: string;
  medicamentosContinuos: string;
  status: 'ativo' | 'inativo';
}

export type TipoProfissional = 'medico' | 'dentista' | 'enfermagem';

export type TipoAtendimento =
  | 'consulta_medica'
  | 'consulta_odontologica'
  | 'retorno'
  | 'urgencia'
  | 'triagem'
  | 'exame'
  | 'vacina';

export type StatusAgendamento = 'agendado' | 'confirmado' | 'em_triagem' | 'em_atendimento' | 'atendido' | 'cancelado' | 'ausente';

export interface Agendamento {
  id: string;
  municipioId: string;
  unidadeId: string;
  pacienteId: string;
  profissionalId: string; // Medico ID, Dentista ID, or Enfermeiro/Generic ID
  tipoProfissional: TipoProfissional;
  tipoAtendimento: TipoAtendimento;
  data: string; // 'YYYY-MM-DD'
  horario: string; // 'HH:MM'
  status: StatusAgendamento;
  prioridade: 'normal' | 'preferencial' | 'urgencia';
  observacao?: string;
  senhaFila?: string; // e.g. 'M-201', 'D-102'
}

export type ClassificacaoRisco = 'verde' | 'azul' | 'amarelo' | 'laranja' | 'vermelho';

export interface Triagem {
  id: string;
  pacienteId: string;
  agendamentoId: string;
  enfermeiroId: string;
  pressao: string; // '120/80'
  temperatura: string; // '36.5'
  peso: string; // '72'
  altura: string; // '1.75'
  imc: string; // '23.5'
  glicemia: string; // '95'
  oxigenacao: string; // '98'
  sintomas: string;
  classificacaoRisco: ClassificacaoRisco; // Manchester system
  observacoes?: string;
  dataHora: string;
}

export interface ProntuarioMedico {
  id: string;
  pacienteId: string;
  medicoId: string;
  agendamentoId: string;
  queixaPrincipal: string;
  historico: string;
  diagnostico: string;
  cid: string; // e.g. 'I10'
  conduta: string;
  observacoes?: string;
  retorno: boolean;
  dataAtendimento: string;
}

export interface ProntuarioOdontologico {
  id: string;
  pacienteId: string;
  dentistaId: string;
  agendamentoId: string;
  queixaPrincipal: string;
  avaliacaoOdontologica: string;
  procedimentoRealizado: string;
  procedimentoPlanejado?: string;
  diagnostico?: string;
  odontogramaEstado?: string;
  observacoes?: string;
  retorno: boolean;
  dataAtendimento: string;
}

export type StatusDente =
  | 'saudavel'
  | 'carie'
  | 'extraido'
  | 'restauracao'
  | 'canal'
  | 'protese'
  | 'fratura'
  | 'lesao'
  | 'pendente'
  | 'concluido';

export interface OdontogramaRegistro {
  id: string;
  pacienteId: string;
  dentistaId: string;
  dente: number; // 11 to 48 (ISO notation or 1 to 32)
  face: 'O' | 'M' | 'D' | 'V' | 'L' | 'geral'; // Occlusal, Mesial, Distal, Vestibular, Lingual, or whole tooth
  status: StatusDente;
  procedimentoId?: string;
  observacao?: string;
  dataAtualizacao: string;
}

export interface ProcedimentoOdontologico {
  id: string;
  pacienteId: string;
  dentistaId: string;
  agendamentoId: string;
  tipoProcedimento: string; // 'Limpeza', 'Restauração', 'Extração', etc.
  dente?: number;
  descricao: string;
  status: 'pendente' | 'concluido';
  dataProcedimento: string;
}

export interface Receita {
  id: string;
  pacienteId: string;
  profissionalId: string;
  tipoProfissional: 'medico' | 'dentista';
  agendamentoId: string;
  tipoReceita: 'simples' | 'uso_continuo' | 'controlada';
  descricao: string;
  medicamentos: string; // List of drugs & dosages
  validade: string; // e.g., '6 meses' or '30 dias'
  necessitaViaFisica: boolean;
  arquivoPdf?: string;
  status: 'ativa' | 'dispensada' | 'vencida';
  dataEmissao: string;
}

export interface Medicamento {
  id: string;
  municipioId: string;
  nome: string;
  principioAtivo: string;
  dosagem: string;
  forma: string; // 'Comprimido', 'Xarope', 'Injetável' etc.
  categoria: string; // 'Analgésico', 'Antibiótico', 'Anti-hipertensivo'
  status: 'ativo' | 'inativo';
}

export interface EstoqueMedicamento {
  id: string;
  unidadeId: string;
  medicamentoId: string;
  quantidade: number;
  lote: string;
  validade: string;
  dataEntrada: string;
  status: 'ativo' | 'esgotado' | 'vencido';
}

export interface EntregaMedicamento {
  id: string;
  pacienteId: string;
  receitaId: string;
  medicamentoId: string;
  farmaciaId: string; // UnidadeId (Farmácia municipal)
  quantidadeEntregue: number;
  responsavelEntregaId: string; // Usuario ID
  dataEntrega: string;
}

export interface Exame {
  id: string;
  pacienteId: string;
  medicoId: string;
  agendamentoId: string;
  tipoExame: string; // 'Hemograma', 'Raio-X Tórax', 'Urina'
  descricao: string;
  status: 'solicitado' | 'realizado' | 'entregue' | 'cancelado';
  arquivoResultado?: string;
  dataSolicitacao: string;
  dataResultado?: string;
  resultadoObservacao?: string;
}

export interface Encaminhamento {
  id: string;
  pacienteId: string;
  profissionalId: string;
  tipoProfissional: 'medico' | 'dentista';
  especialidadeDestino: string; // 'Cardiologia', 'Ortodontia', etc.
  motivo: string;
  prioridade: 'normal' | 'preferencial' | 'urgente';
  status: 'pendente' | 'encaminhado' | 'atendido' | 'cancelado';
  dataSolicitacao: string;
}

export interface Vacina {
  id: string;
  nome: string;
  descricao: string;
  idadeRecomendada: string;
  doses: number;
  intervalo?: string;
}

export interface CarteiraVacinacao {
  id: string;
  pacienteId: string;
  vacinaId: string;
  unidadeId: string;
  profissionalId: string;
  dose: string; // '1ª Dose', '2ª Dose', 'Reforço'
  lote: string;
  dataAplicacao: string;
  proximaDose?: string;
}

export interface Noticia {
  id: string;
  municipioId: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  imagem: string; // image placeholder/url
  categoria: 'Secretaria' | 'Campanha' | 'Informativo' | 'Comunicado';
  publicado: boolean;
  dataPublicacao: string;
}

export interface Campanha {
  id: string;
  municipioId: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  unidadeId?: string; // Optional unit hosting it
  imagem: string;
  status: 'planejada' | 'ativa' | 'concluida';
}

export interface Notificacao {
  id: string;
  usuarioId: string;
  titulo: string;
  mensagem: string;
  tipo: 'consulta' | 'medicamento' | 'campanha' | 'sistema';
  lida: boolean;
  dataEnvio: string;
}

export interface OuvidoriaTicket {
  id: string;
  municipioId: string;
  pacienteNome?: string;
  pacienteEmail?: string;
  tipo: 'reclamacao' | 'sugestao' | 'elogio' | 'solicitacao';
  assunto: string;
  mensagem: string;
  protocolo: string;
  status: 'novo' | 'em_analise' | 'respondido' | 'arquivado';
  resposta?: string;
  dataCriacao: string;
}

export interface LogAuditoria {
  id: string;
  usuarioId: string;
  municipioId: string;
  acao: string;
  tabelaAfetada: string;
  registroId: string;
  dadosAntes?: string;
  dadosDepois?: string;
  ip: string;
  dataHora: string;
}

export type TipoVisita = 
  | 'gestante' 
  | 'puerpera' 
  | 'recem_nascido' 
  | 'diabetico' 
  | 'hipertenso' 
  | 'vacinas_atrasadas' 
  | 'visita_geral';

export interface VisitaDomiciliar {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  agenteId: string;
  tipoVisita: TipoVisita;
  dataVisita: string;
  pressaoAferida?: string;
  glicemiaAferida?: number;
  sintomasRelatados?: string;
  acoesRealizadas: string;
  observacoes?: string;
  status: 'planejado' | 'concluido' | 'cancelado';
}

