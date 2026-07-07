/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Municipio,
  Secretaria,
  UnidadeSaude,
  Bairro,
  Usuario,
  Funcionario,
  Medico,
  Dentista,
  AgenteSaude,
  Paciente,
  Agendamento,
  Triagem,
  ProntuarioMedico,
  ProntuarioOdontologico,
  OdontogramaRegistro,
  ProcedimentoOdontologico,
  Receita,
  Medicamento,
  EstoqueMedicamento,
  EntregaMedicamento,
  Exame,
  Encaminhamento,
  Vacina,
  CarteiraVacinacao,
  Noticia,
  Campanha,
  Notificacao,
  OuvidoriaTicket,
  LogAuditoria,
  StatusAgendamento,
  VisitaDomiciliar
} from '../types';
import { saveToParse, loadFromParse } from './parseSync';

const STORAGE_KEY = 'saas_municipal_saude_db';

interface MockDatabase {
  municipios: Municipio[];
  secretarias: Secretaria[];
  unidadesSaude: UnidadeSaude[];
  bairros: Bairro[];
  usuarios: Usuario[];
  funcionarios: Funcionario[];
  medicos: Medico[];
  dentistas: Dentista[];
  agentesSaude: AgenteSaude[];
  pacientes: Paciente[];
  agendamentos: Agendamento[];
  triagens: Triagem[];
  prontuariosMedicos: ProntuarioMedico[];
  prontuariosOdontologicos: ProntuarioOdontologico[];
  odontograma: OdontogramaRegistro[];
  procedimentosOdontologicos: ProcedimentoOdontologico[];
  receitas: Receita[];
  medicamentos: Medicamento[];
  estoqueMedicamentos: EstoqueMedicamento[];
  entregaMedicamentos: EntregaMedicamento[];
  exames: Exame[];
  encaminhamentos: Encaminhamento[];
  vacinas: Vacina[];
  carteiraVacinacao: CarteiraVacinacao[];
  noticias: Noticia[];
  campanhas: Campanha[];
  notificacoes: Notificacao[];
  ouvidoria: OuvidoriaTicket[];
  logsAuditoria: LogAuditoria[];
  visitasDomiciliares: VisitaDomiciliar[];
}

// Initial Seed Data
const seedMunicipios: Municipio[] = [
  {
    id: 'mun-1',
    nome: 'Santa Esperança',
    estado: 'PR',
    cnpj: '12.345.678/0001-90',
    corPrincipal: '#0284c7', // Sky-600
    dominio: 'santaesperanca.pr.gov.br',
    status: 'ativo',
    dataCriacao: '2024-01-10T10:00:00Z'
  }
];

const seedSecretarias: Secretaria[] = [
  {
    id: 'sec-1',
    municipioId: 'mun-1',
    nome: 'Secretaria Municipal de Saúde de Santa Esperança',
    telefone: '(44) 3211-5544',
    email: 'saude@santaesperanca.pr.gov.br',
    endereco: 'Av. Brasil, 1200 - Centro',
    secretarioResponsavel: 'Dr. Roberto Cavalcanti'
  }
];

const seedBairros: Bairro[] = [
  { id: 'b-1', municipioId: 'mun-1', nome: 'Centro', unidadeResponsavelId: 'unit-1' },
  { id: 'b-2', municipioId: 'mun-1', nome: 'Jardim Alvorada', unidadeResponsavelId: 'unit-1' },
  { id: 'b-3', municipioId: 'mun-1', nome: 'Vila Nova', unidadeResponsavelId: 'unit-2' },
  { id: 'b-4', municipioId: 'mun-1', nome: 'Parque das Nações', unidadeResponsavelId: 'unit-2' }
];

const seedUnidades: UnidadeSaude[] = [
  {
    id: 'unit-1',
    municipioId: 'mun-1',
    nome: 'UBS Central - Dr. Arnaldo Gouveia',
    tipoUnidade: 'UBS',
    endereco: 'Rua das Flores, 450 - Centro',
    bairroId: 'b-1',
    telefone: '(44) 3211-9001',
    horarioFuncionamento: '07:00 às 17:00',
    status: 'ativo'
  },
  {
    id: 'unit-2',
    municipioId: 'mun-1',
    nome: 'ESF Jardim Alvorada',
    tipoUnidade: 'ESF',
    endereco: 'Av. das Palmeiras, 900 - Jardim Alvorada',
    bairroId: 'b-2',
    telefone: '(44) 3211-9002',
    horarioFuncionamento: '07:30 às 16:30',
    status: 'ativo'
  },
  {
    id: 'unit-3',
    municipioId: 'mun-1',
    nome: 'Farmácia Municipal Central',
    tipoUnidade: 'Farmácia Municipal',
    endereco: 'Rua São Paulo, 120 - Centro',
    bairroId: 'b-1',
    telefone: '(44) 3211-9003',
    horarioFuncionamento: '08:00 às 18:00',
    status: 'ativo'
  }
];

const seedUsuarios: Usuario[] = [
  {
    id: 'usr-admin',
    municipioId: 'mun-1',
    nome: 'Mariana Silveira',
    email: 'admin.saude@santaesperanca.pr.gov.br',
    telefone: '(44) 99888-1111',
    cpf: '000.000.000-01',
    perfil: 'admin_geral',
    status: 'ativo',
    ultimoAcesso: '2026-07-07T08:30:00Z'
  },
  {
    id: 'usr-unidade',
    municipioId: 'mun-1',
    nome: 'Carlos Souza',
    email: 'carlos.ubs@santaesperanca.pr.gov.br',
    telefone: '(44) 99888-2222',
    cpf: '000.000.000-02',
    perfil: 'admin_unidade',
    status: 'ativo',
    ultimoAcesso: '2026-07-07T08:45:00Z'
  },
  {
    id: 'usr-medico',
    municipioId: 'mun-1',
    nome: 'Dr. Roberto Cavalcanti',
    email: 'roberto.medico@santaesperanca.pr.gov.br',
    telefone: '(44) 99888-3333',
    cpf: '000.000.000-03',
    perfil: 'medico',
    status: 'ativo',
    ultimoAcesso: '2026-07-07T09:00:00Z'
  },
  {
    id: 'usr-dentista',
    municipioId: 'mun-1',
    nome: 'Dra. Beatriz Santos',
    email: 'beatriz.dentista@santaesperanca.pr.gov.br',
    telefone: '(44) 99888-4444',
    cpf: '000.000.000-04',
    perfil: 'dentista',
    status: 'ativo',
    ultimoAcesso: '2026-07-07T09:15:00Z'
  },
  {
    id: 'usr-enfermeiro',
    municipioId: 'mun-1',
    nome: 'Juliana Rocha',
    email: 'juliana.enfermeira@santaesperanca.pr.gov.br',
    telefone: '(44) 99888-5555',
    cpf: '000.000.000-05',
    perfil: 'enfermeiro',
    status: 'ativo',
    ultimoAcesso: '2026-07-07T07:45:00Z'
  },
  {
    id: 'usr-agente',
    municipioId: 'mun-1',
    nome: 'Marcos Oliveira',
    email: 'marcos.acs@santaesperanca.pr.gov.br',
    telefone: '(44) 99888-6666',
    cpf: '000.000.000-06',
    perfil: 'agente_saude',
    status: 'ativo',
    ultimoAcesso: '2026-07-07T07:30:00Z'
  },
  {
    id: 'usr-farmacia',
    municipioId: 'mun-1',
    nome: 'Renata Lins',
    email: 'renata.farmacia@santaesperanca.pr.gov.br',
    telefone: '(44) 99888-7777',
    cpf: '000.000.000-07',
    perfil: 'farmacia',
    status: 'ativo',
    ultimoAcesso: '2026-07-07T08:10:00Z'
  },
  {
    id: 'usr-paciente',
    municipioId: 'mun-1',
    nome: 'Ana Maria da Silva',
    email: 'ana.paciente@gmail.com',
    telefone: '(44) 99911-2233',
    cpf: '111.111.111-11',
    perfil: 'paciente',
    status: 'ativo',
    ultimoAcesso: '2026-07-07T09:30:00Z'
  },
  {
    id: 'usr-paciente2',
    municipioId: 'mun-1',
    nome: 'João Pedro Santos',
    email: 'joao.pedro@hotmail.com',
    telefone: '(44) 99922-3344',
    cpf: '222.222.222-22',
    perfil: 'paciente',
    status: 'ativo',
    ultimoAcesso: '2026-07-05T14:15:00Z'
  },
  {
    id: 'usr-paciente3',
    municipioId: 'mun-1',
    nome: 'José de Alencar',
    email: 'jose.alencar@gmail.com',
    telefone: '(44) 99933-4455',
    cpf: '444.444.444-44',
    perfil: 'paciente',
    status: 'ativo',
    ultimoAcesso: '2026-07-06T11:20:00Z'
  }
];

const seedFuncionarios: Funcionario[] = [
  {
    id: 'func-med-1',
    usuarioId: 'usr-medico',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    nome: 'Dr. Roberto Cavalcanti',
    cpf: '000.000.000-03',
    cargo: 'Médico Clínico Geral',
    registroProfissional: 'CRM/PR 45213',
    especialidade: 'Clínica Médica',
    status: 'ativo'
  },
  {
    id: 'func-dent-1',
    usuarioId: 'usr-dentista',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    nome: 'Dra. Beatriz Santos',
    cpf: '000.000.000-04',
    cargo: 'Dentista Bucomaxilo',
    registroProfissional: 'CRO/PR 12984',
    especialidade: 'Odontopediatria e Saúde Bucal',
    status: 'ativo'
  },
  {
    id: 'func-enf-1',
    usuarioId: 'usr-enfermeiro',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    nome: 'Juliana Rocha',
    cpf: '000.000.000-05',
    cargo: 'Enfermeira de Triagem',
    registroProfissional: 'COREN/PR 88521',
    especialidade: 'Saúde da Família',
    status: 'ativo'
  },
  {
    id: 'func-ag-1',
    usuarioId: 'usr-agente',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    nome: 'Marcos Oliveira',
    cpf: '000.000.000-06',
    cargo: 'Agente Comunitário de Saúde',
    registroProfissional: 'MUNICIPAL-ACS-09',
    especialidade: 'Microárea 01 - Centro',
    status: 'ativo'
  },
  {
    id: 'func-farm-1',
    usuarioId: 'usr-farmacia',
    municipioId: 'mun-1',
    unidadeId: 'unit-3',
    nome: 'Renata Lins',
    cpf: '000.000.000-07',
    cargo: 'Farmacêutica Responsável',
    registroProfissional: 'CRF/PR 22119',
    especialidade: 'Farmácia Clínica',
    status: 'ativo'
  }
];

const seedMedicos: Medico[] = [
  {
    id: 'med-1',
    funcionarioId: 'func-med-1',
    crm: 'CRM/PR 45213',
    especialidade: 'Clínica Médica',
    unidadeId: 'unit-1',
    bairrosAtendidos: ['b-1', 'b-2'],
    diasAtendimento: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    horarioInicio: '08:00',
    horarioFim: '17:00',
    status: 'ativo'
  }
];

const seedDentistas: Dentista[] = [
  {
    id: 'dent-1',
    funcionarioId: 'func-dent-1',
    cro: 'CRO/PR 12984',
    especialidadeOdontologica: 'Clínica Geral e Odontopediatria',
    unidadeId: 'unit-1',
    diasAtendimento: ['Seg', 'Ter', 'Qua', 'Qui'],
    horarioInicio: '08:00',
    horarioFim: '16:00',
    status: 'ativo'
  }
];

const seedAgentes: AgenteSaude[] = [
  {
    id: 'ag-1',
    funcionarioId: 'func-ag-1',
    unidadeId: 'unit-1',
    bairrosAtendidos: ['b-1'],
    microarea: 'Microárea Centro 01',
    status: 'ativo'
  }
];

const seedPacientes: Paciente[] = [
  {
    id: 'pac-1',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    bairroId: 'b-1',
    agenteSaudeId: 'ag-1',
    medicoResponsavelId: 'med-1',
    dentistaResponsavelId: 'dent-1',
    nome: 'Ana Maria da Silva',
    cpf: '111.111.111-11',
    cartaoSus: '898 0012 3456 7890',
    dataNascimento: '1985-05-15',
    sexo: 'F',
    telefone: '(44) 99911-2233',
    email: 'ana.paciente@gmail.com',
    endereco: 'Rua XV de Novembro',
    numero: '1020',
    cep: '87013-230',
    alergias: 'Penicilina e Dipirona',
    doencasCronicas: 'Hipertensão Arterial',
    medicamentosContinuos: 'Losartana 50mg (1x ao dia)',
    status: 'ativo'
  },
  {
    id: 'pac-2',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    bairroId: 'b-1',
    agenteSaudeId: 'ag-1',
    medicoResponsavelId: 'med-1',
    dentistaResponsavelId: 'dent-1',
    nome: 'João Pedro Santos',
    cpf: '222.222.222-22',
    cartaoSus: '898 0012 8876 1122',
    dataNascimento: '1962-11-22',
    sexo: 'M',
    telefone: '(44) 99922-3344',
    email: 'joao.pedro@hotmail.com',
    endereco: 'Av. Paraná',
    numero: '450',
    complemento: 'Apto 102',
    cep: '87013-050',
    alergias: 'Nenhuma conhecida',
    doencasCronicas: 'Hipertensão Arterial, Diabetes Tipo 2',
    medicamentosContinuos: 'Metformina 850mg (2x ao dia), Losartana 50mg (1x ao dia)',
    status: 'ativo'
  },
  {
    id: 'pac-3',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    bairroId: 'b-2',
    agenteSaudeId: 'ag-1',
    medicoResponsavelId: 'med-1',
    dentistaResponsavelId: 'dent-1',
    nome: 'José de Alencar',
    cpf: '444.444.444-44',
    cartaoSus: '898 0012 9999 5555',
    dataNascimento: '1974-08-03',
    sexo: 'M',
    telefone: '(44) 99933-4455',
    email: 'jose.alencar@gmail.com',
    endereco: 'Rua Cambará',
    numero: '18',
    cep: '87014-110',
    alergias: 'Alergia a Ácaros e Sulfa',
    doencasCronicas: 'Asma Brônquica',
    medicamentosContinuos: 'Salbutamol Spray (sob demanda)',
    status: 'ativo'
  }
];

const seedAgendamentos: Agendamento[] = [
  {
    id: 'agenda-1',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    pacienteId: 'pac-1',
    profissionalId: 'med-1',
    tipoProfissional: 'medico',
    tipoAtendimento: 'consulta_medica',
    data: '2026-07-07',
    horario: '10:00',
    status: 'em_triagem',
    prioridade: 'normal',
    observacao: 'Paciente relata dor de cabeça persistente e tontura leve.',
    senhaFila: 'M-101'
  },
  {
    id: 'agenda-2',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    pacienteId: 'pac-3',
    profissionalId: 'dent-1',
    tipoProfissional: 'dentista',
    tipoAtendimento: 'consulta_odontologica',
    data: '2026-07-07',
    horario: '11:00',
    status: 'confirmado',
    prioridade: 'normal',
    observacao: 'Dor intensa no molar inferior esquerdo.',
    senhaFila: 'O-201'
  },
  {
    id: 'agenda-3',
    municipioId: 'mun-1',
    unidadeId: 'unit-1',
    pacienteId: 'pac-2',
    profissionalId: 'med-1',
    tipoProfissional: 'medico',
    tipoAtendimento: 'retorno',
    data: '2026-07-07',
    horario: '14:30',
    status: 'agendado',
    prioridade: 'preferencial',
    observacao: 'Apresentar exames de sangue rotineiros.',
    senhaFila: 'M-102'
  }
];

const seedTriagens: Triagem[] = [
  {
    id: 'triag-1',
    pacienteId: 'pac-1',
    agendamentoId: 'agenda-1',
    enfermeiroId: 'func-enf-1',
    pressao: '145/95',
    temperatura: '36.7',
    peso: '68',
    altura: '1.63',
    imc: '25.6',
    glicemia: '102',
    oxigenacao: '98',
    sintomas: 'Dor de cabeça frontal de forte intensidade, tontura ao levantar, início há 2 dias.',
    classificacaoRisco: 'amarelo',
    observacoes: 'Paciente hipertensa com PA elevada na triagem. Recomenda-se prioridade moderada.',
    dataHora: '2026-07-07T08:15:00Z'
  }
];

const seedMedicamentos: Medicamento[] = [
  { id: 'medic-1', municipioId: 'mun-1', nome: 'Dipirona Sódica', principioAtivo: 'Dipirona Sódica', dosagem: '500mg', forma: 'Comprimido', categoria: 'Analgésico', status: 'ativo' },
  { id: 'medic-2', municipioId: 'mun-1', nome: 'Losartana Potássica', principioAtivo: 'Losartana Potássica', dosagem: '500mg', forma: 'Comprimido', categoria: 'Anti-hipertensivo', status: 'ativo' },
  { id: 'medic-3', municipioId: 'mun-1', nome: 'Amoxicilina + Clavulanato', principioAtivo: 'Amoxicilina Sódica + Clavulanato Potássico', dosagem: '875mg + 125mg', forma: 'Comprimido Revestido', categoria: 'Antibiótico', status: 'ativo' },
  { id: 'medic-4', municipioId: 'mun-1', nome: 'Paracetamol', principioAtivo: 'Paracetamol', dosagem: '500mg', forma: 'Comprimido', categoria: 'Analgésico / Antitérmico', status: 'ativo' },
  { id: 'medic-5', municipioId: 'mun-1', nome: 'Metformina Cloridrato', principioAtivo: 'Metformina Cloridrato', dosagem: '850mg', forma: 'Comprimido', categoria: 'Hipoglicemiante', status: 'ativo' },
  { id: 'medic-6', municipioId: 'mun-1', nome: 'Clonazepam (Controlado)', principioAtivo: 'Clonazepam', dosagem: '2mg', forma: 'Comprimido', categoria: 'Ansiolítico / Benzodiazepínico', status: 'ativo' }
];

const seedEstoque: EstoqueMedicamento[] = [
  { id: 'est-1', unidadeId: 'unit-3', medicamentoId: 'medic-1', quantidade: 5000, lote: 'DIP2026A', validade: '2028-12-31', dataEntrada: '2025-05-10', status: 'ativo' },
  { id: 'est-2', unidadeId: 'unit-3', medicamentoId: 'medic-2', quantidade: 8200, lote: 'LOS5512B', validade: '2027-09-30', dataEntrada: '2025-04-12', status: 'ativo' },
  { id: 'est-3', unidadeId: 'unit-3', medicamentoId: 'medic-3', quantidade: 450, lote: 'AMX4409X', validade: '2027-02-28', dataEntrada: '2026-02-01', status: 'ativo' },
  { id: 'est-4', unidadeId: 'unit-3', medicamentoId: 'medic-4', quantidade: 3200, lote: 'PAR9011C', validade: '2028-04-30', dataEntrada: '2025-08-15', status: 'ativo' },
  { id: 'est-5', unidadeId: 'unit-3', medicamentoId: 'medic-5', quantidade: 6000, lote: 'MET8811K', validade: '2027-06-30', dataEntrada: '2025-06-20', status: 'ativo' },
  { id: 'est-6', unidadeId: 'unit-3', medicamentoId: 'medic-6', quantidade: 210, lote: 'CLO7712M', validade: '2027-11-30', dataEntrada: '2025-11-15', status: 'ativo' }
];

const seedOdontograma: OdontogramaRegistro[] = [
  // Teeth numbered 11 to 48 (Brazilian Federal Notation).
  // Standard healthy defaults. We can pre-mark some cavity or restorations to make it interesting!
  { id: 'od-1', pacienteId: 'pac-1', dentistaId: 'dent-1', dente: 16, face: 'O', status: 'restauracao', dataAtualizacao: '2025-10-12' },
  { id: 'od-2', pacienteId: 'pac-1', dentistaId: 'dent-1', dente: 24, face: 'geral', status: 'extraido', dataAtualizacao: '2025-10-12' },
  { id: 'od-3', pacienteId: 'pac-3', dentistaId: 'dent-1', dente: 36, face: 'O', status: 'carie', observacao: 'Cárie profunda dolorosa no dente 36', dataAtualizacao: '2026-07-06' }
];

const seedVacinas: Vacina[] = [
  { id: 'vac-1', nome: 'BCG', descricao: 'Previne formas graves de tuberculose.', idadeRecomendada: 'Ao nascer', doses: 1 },
  { id: 'vac-2', nome: 'Hepatite B', descricao: 'Previne a hepatite do tipo B.', idadeRecomendada: 'Ao nascer / 2, 4, 6 meses', doses: 4 },
  { id: 'vac-3', nome: 'Pentavalente', descricao: 'Difteria, Tétano, Coqueluche, Hepatite B, Meningite.', idadeRecomendada: '2, 4 e 6 meses', doses: 3 },
  { id: 'vac-4', nome: 'Tríplice Viral', descricao: 'Previne Sarampo, Caxumba e Rubéola.', idadeRecomendada: '12 e 15 meses', doses: 2 },
  { id: 'vac-5', nome: 'Febre Amarela', descricao: 'Previne a Febre Amarela.', idadeRecomendada: '9 meses', doses: 1 },
  { id: 'vac-6', nome: 'Gripe (Influenza)', descricao: 'Dose anual sazonal contra a gripe.', idadeRecomendada: 'Anual (Acima de 6 meses)', doses: 1 }
];

const seedCarteira: CarteiraVacinacao[] = [
  { id: 'cv-1', pacienteId: 'pac-1', vacinaId: 'vac-1', unidadeId: 'unit-1', profissionalId: 'func-enf-1', dose: 'Única', lote: 'BCG4412', dataAplicacao: '1985-05-18' },
  { id: 'cv-2', pacienteId: 'pac-1', vacinaId: 'vac-6', unidadeId: 'unit-1', profissionalId: 'func-enf-1', dose: 'Anual 2026', lote: 'FLU66112', dataAplicacao: '2026-04-15', proximaDose: '2027-04-15' },
  { id: 'cv-3', pacienteId: 'pac-2', vacinaId: 'vac-6', unidadeId: 'unit-1', profissionalId: 'func-enf-1', dose: 'Anual 2026', lote: 'FLU66112', dataAplicacao: '2026-04-20', proximaDose: '2027-04-20' }
];

const seedNoticias: Noticia[] = [
  {
    id: 'not-1',
    municipioId: 'mun-1',
    titulo: 'Santa Esperança inicia Campanha de Vacinação contra Dengue',
    resumo: 'A Secretaria de Saúde disponibiliza doses para crianças e adolescentes de 10 a 14 anos em todas as UBS do município.',
    conteudo: 'A Prefeitura de Santa Esperança, por meio de sua Secretaria Municipal de Saúde, dá início à campanha de vacinação contra a Dengue a partir desta segunda-feira. A imunização é focada no público-alvo prioritário de 10 a 14 anos, faixa etária que registra altos índices de hospitalizações pela doença. Para receber a dose, é fundamental que a criança ou adolescente esteja acompanhado dos pais ou responsáveis, portando a carteira de vacinação, documento de identidade e o cartão do SUS.',
    imagem: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60',
    categoria: 'Campanha',
    publicado: true,
    dataPublicacao: '2026-07-05T09:00:00Z'
  },
  {
    id: 'not-2',
    municipioId: 'mun-1',
    titulo: 'Inauguração da Nova Farmácia Municipal com Atendimento Ampliado',
    resumo: 'Nova sede central conta com espaço moderno, ar-condicionado, triagem digital de senhas e maior estoque de medicamentos de uso contínuo.',
    conteudo: 'Os moradores de Santa Esperança contam agora com uma nova sede da Farmácia Municipal Central. O novo espaço, localizado na Rua São Paulo, foi planejado para oferecer mais conforto e agilidade no atendimento. A estrutura dispõe de sala de espera climatizada com 45 assentos, sistema de senha digital integrado e guichês adaptados para acessibilidade. Além disso, o prefeito anunciou a ampliação do estoque municipal, garantindo 100% de fornecimento dos medicamentos contínuos da atenção básica cadastrados na Relação Municipal de Medicamentos (REMUME).',
    imagem: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=60',
    categoria: 'Secretaria',
    publicado: true,
    dataPublicacao: '2026-06-28T14:30:00Z'
  },
  {
    id: 'not-3',
    municipioId: 'mun-1',
    titulo: 'Mutirão de Saúde Bucal atende alunos da Rede Municipal de Ensino',
    resumo: 'Equipes odontológicas móveis realizam triagens, aplicação de flúor e palestras educativas em escolas locais.',
    conteudo: 'Com o objetivo de promover a conscientização de higiene oral desde a infância, a equipe de Saúde Bucal do município realiza o programa "Sorriso Saudável" nas escolas municipais. Dentistas realizam o exame clínico inicial dente a dente diretamente na unidade escolar. Crianças diagnosticadas com necessidade de tratamentos complexos, como cáries profundas ou canal, já saem do mutirão com consulta pré-agendada na Unidade Odontológica Central ou UBS do seu bairro de referência.',
    imagem: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=60',
    categoria: 'Informativo',
    publicado: true,
    dataPublicacao: '2026-06-15T08:00:00Z'
  }
];

const seedCampanhas: Campanha[] = [
  {
    id: 'camp-1',
    municipioId: 'mun-1',
    titulo: 'Novembro Azul: Prevenção é Saúde',
    descricao: 'Mutirão de consultas urológicas e exames de PSA para homens acima de 45 anos em todas as unidades de saúde.',
    dataInicio: '2026-11-01',
    dataFim: '2026-11-30',
    unidadeId: 'unit-1',
    imagem: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=60',
    status: 'planejada'
  },
  {
    id: 'camp-2',
    municipioId: 'mun-1',
    titulo: 'Campanha de Combate à Dengue 2026',
    descricao: 'Todos contra o mosquito! Agentes comunitários de saúde realizam visitas intensivas para conscientização e eliminação de focos.',
    dataInicio: '2026-07-01',
    dataFim: '2026-07-31',
    unidadeId: 'unit-1',
    imagem: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60',
    status: 'ativa'
  }
];

const seedOuvidoria: OuvidoriaTicket[] = [
  {
    id: 't-1',
    municipioId: 'mun-1',
    pacienteNome: 'João Pedro Santos',
    pacienteEmail: 'joao.pedro@hotmail.com',
    tipo: 'elogio',
    assunto: 'Excelente atendimento na UBS Central',
    mensagem: 'Gostaria de elogiar a equipe da triagem e o médico Dr. Roberto pelo atendimento atencioso. Fui atendido no horário e com muito profissionalismo.',
    protocolo: 'OUV-2026-09412',
    status: 'respondido',
    resposta: 'Agradecemos imensamente o seu retorno! Ficamos felizes em saber que nosso esforço diário para prestar um serviço público humanizado e de excelência está sendo percebido. Seu elogio foi compartilhado com a equipe da UBS Central e o Dr. Roberto.',
    dataCriacao: '2026-07-04T13:20:00Z'
  }
];

const seedProntuariosMedicos: ProntuarioMedico[] = [
  {
    id: 'pm-1',
    pacienteId: 'pac-1',
    medicoId: 'med-1',
    agendamentoId: 'agenda-1',
    queixaPrincipal: 'Cefaleia frontal recorrente e cefaleia holocraniana.',
    historico: 'Paciente relata dores de cabeça frequentes nos últimos meses, mais frequentes nas últimas duas semanas. Dor piora em períodos de estresse, acompanhada de tontura e formigamento discreto em membros.',
    diagnostico: 'Hipertensão Arterial Sistêmica não controlada.',
    cid: 'I10',
    conduta: 'Orientada alteração do estilo de vida, dieta hipossódica e atividade física moderada. Prescrita medicação regular Losartana 50mg.',
    observacoes: 'Solicitado mapa de PA de 24h e hemograma completo com eletrólitos.',
    retorno: true,
    dataAtendimento: '2026-05-10'
  }
];

const seedProntuariosOdonto: ProntuarioOdontologico[] = [
  {
    id: 'po-1',
    pacienteId: 'pac-1',
    dentistaId: 'dent-1',
    agendamentoId: 'agenda-2',
    queixaPrincipal: 'Avaliação de rotina e tártaro nos dentes inferiores.',
    avaliacaoOdontologica: 'Presença de gengivite leve em arcada inferior, tártaro na face lingual dos incisivos inferiores.',
    procedimentoRealizado: 'Raspagem supra-gengival, profilaxia e aplicação de flúor.',
    procedimentoPlanejado: 'Reavaliação em 6 meses.',
    observacoes: 'Instruções de higiene bucal e uso de fio dental reforçadas.',
    retorno: false,
    dataAtendimento: '2025-10-12'
  }
];

const seedReceitas: Receita[] = [
  {
    id: 'rec-1',
    pacienteId: 'pac-1',
    profissionalId: 'med-1',
    tipoProfissional: 'medico',
    agendamentoId: 'agenda-1',
    tipoReceita: 'uso_continuo',
    descricao: 'Tratamento de Hipertensão Arterial Crônica.',
    medicamentos: '1. Losartana Potássica 50mg - Tomar 1 comprimido via oral pela manhã.\n2. Hidroclorotiazida 25mg - Tomar 1 comprimido via oral pela manhã.',
    validade: '6 meses',
    necessitaViaFisica: false,
    status: 'ativa',
    dataEmissao: '2026-07-07'
  }
];

const seedExames: Exame[] = [
  {
    id: 'ex-1',
    pacienteId: 'pac-1',
    medicoId: 'med-1',
    agendamentoId: 'agenda-1',
    tipoExame: 'Hemograma Completo',
    descricao: 'Hemograma completo com dosagem de Creatinina, Potássio e Sódio séricos.',
    status: 'solicitado',
    dataSolicitacao: '2026-07-07'
  }
];

const seedEncaminhamentos: Encaminhamento[] = [
  {
    id: 'enc-1',
    pacienteId: 'pac-1',
    profissionalId: 'med-1',
    tipoProfissional: 'medico',
    especialidadeDestino: 'Cardiologia',
    motivo: 'Paciente com hipertensão refratária de início recente, associada a episódios de taquicardia paroxística. Solicita-se avaliação especializada.',
    prioridade: 'normal',
    status: 'pendente',
    dataSolicitacao: '2026-07-07'
  }
];

const seedNotificacoes: Notificacao[] = [
  {
    id: 'notif-1',
    usuarioId: 'usr-paciente',
    titulo: 'Nova Consulta Agendada',
    mensagem: 'Sua consulta médica com o Dr. Roberto foi confirmada para 07/07/2026 às 10:00 na UBS Central.',
    tipo: 'consulta',
    lida: false,
    dataEnvio: '2026-07-06T15:00:00Z'
  },
  {
    id: 'notif-2',
    usuarioId: 'usr-paciente',
    titulo: 'Receita Emitida',
    mensagem: 'Uma receita de Losartana Potássica foi emitida para você. Disponível para retirada na Farmácia Municipal.',
    tipo: 'medicamento',
    lida: false,
    dataEnvio: '2026-07-07T10:30:00Z'
  }
];

const seedLogs: LogAuditoria[] = [
  {
    id: 'log-1',
    usuarioId: 'usr-admin',
    municipioId: 'mun-1',
    acao: 'Login efetuado com sucesso',
    tabelaAfetada: 'Usuarios',
    registroId: 'usr-admin',
    ip: '192.168.1.10',
    dataHora: '2026-07-07T08:30:00Z'
  },
  {
    id: 'log-2',
    usuarioId: 'usr-admin',
    municipioId: 'mun-1',
    acao: 'Vinculou Bairro Centro à UBS Central',
    tabelaAfetada: 'Bairros',
    registroId: 'b-1',
    dadosAntes: '{"unidadeResponsavelId": ""}',
    dadosDepois: '{"unidadeResponsavelId": "unit-1"}',
    ip: '192.168.1.10',
    dataHora: '2026-07-07T08:40:00Z'
  }
];

const defaultDatabase: MockDatabase = {
  municipios: seedMunicipios,
  secretarias: seedSecretarias,
  unidadesSaude: seedUnidades,
  bairros: seedBairros,
  usuarios: seedUsuarios,
  funcionarios: seedFuncionarios,
  medicos: seedMedicos,
  dentistas: seedDentistas,
  agentesSaude: seedAgentes,
  pacientes: seedPacientes,
  agendamentos: seedAgendamentos,
  triagens: seedTriagens,
  prontuariosMedicos: seedProntuariosMedicos,
  prontuariosOdontologicos: seedProntuariosOdonto,
  odontograma: seedOdontograma,
  procedimentosOdontologicos: [],
  receitas: seedReceitas,
  medicamentos: seedMedicamentos,
  estoqueMedicamentos: seedEstoque,
  entregaMedicamentos: [],
  exames: seedExames,
  encaminhamentos: seedEncaminhamentos,
  vacinas: seedVacinas,
  carteiraVacinacao: seedCarteira,
  noticias: seedNoticias,
  campanhas: seedCampanhas,
  notificacoes: seedNotificacoes,
  ouvidoria: seedOuvidoria,
  logsAuditoria: seedLogs,
  visitasDomiciliares: []
};

export class MockDb {
  private static getDb(): MockDatabase {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
      return defaultDatabase;
    }
    try {
      return JSON.parse(data);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
      return defaultDatabase;
    }
  }

  private static saveDb(db: MockDatabase) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    saveToParse(db);
  }

  public static reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
    return defaultDatabase;
  }

  // GENERAL GETTERS
  public static getMunicipios() { return this.getDb().municipios; }
  public static getSecretarias() { return this.getDb().secretarias; }
  public static getUnidadesSaude() { return this.getDb().unidadesSaude; }
  public static getBairros() { return this.getDb().bairros; }
  public static getUsuarios() { return this.getDb().usuarios; }
  public static getFuncionarios() { return this.getDb().funcionarios; }
  public static getMedicos() { return this.getDb().medicos; }
  public static getDentistas() { return this.getDb().dentistas; }
  public static getAgentesSaude() { return this.getDb().agentesSaude; }
  public static getPacientes() { return this.getDb().pacientes; }
  public static getAgendamentos() { return this.getDb().agendamentos; }
  public static getTriagens() { return this.getDb().triagens; }
  public static getProntuariosMedicos() { return this.getDb().prontuariosMedicos; }
  public static getProntuariosOdontologicos() { return this.getDb().prontuariosOdontologicos; }
  public static getOdontograma() { return this.getDb().odontograma; }
  public static getProcedimentosOdontologicos() { return this.getDb().procedimentosOdontologicos; }
  public static getReceitas() { return this.getDb().receitas; }
  public static getMedicamentos() { return this.getDb().medicamentos; }
  public static getEstoqueMedicamentos() { return this.getDb().estoqueMedicamentos; }
  public static getEntregaMedicamentos() { return this.getDb().entregaMedicamentos; }
  public static getExames() { return this.getDb().exames; }
  public static getEncaminhamentos() { return this.getDb().encaminhamentos; }
  public static getVacinas() { return this.getDb().vacinas; }
  public static getCarteiraVacinacao() { return this.getDb().carteiraVacinacao; }
  public static getNoticias() { return this.getDb().noticias; }
  public static getCampanhas() { return this.getDb().campanhas; }
  public static getNotificacoes() { return this.getDb().notificacoes; }
  public static getOuvidoria() { return this.getDb().ouvidoria; }
  public static getLogsAuditoria() { return this.getDb().logsAuditoria; }
  public static getVisitasDomiciliares() { return this.getDb().visitasDomiciliares; }

  // GENERAL INSERTS / UPDATES (CRUD)
  public static addUnidadeSaude(unidade: UnidadeSaude) {
    const db = this.getDb();
    db.unidadesSaude.push(unidade);
    this.saveDb(db);
    this.log('usr-admin', 'Cadastro de Unidade', 'UnidadesSaude', unidade.id, undefined, JSON.stringify(unidade));
  }

  public static addBairro(bairro: Bairro) {
    const db = this.getDb();
    db.bairros.push(bairro);
    this.saveDb(db);
    this.log('usr-admin', 'Cadastro de Bairro', 'Bairros', bairro.id, undefined, JSON.stringify(bairro));
  }

  public static updateBairro(bairro: Bairro) {
    const db = this.getDb();
    const index = db.bairros.findIndex(b => b.id === bairro.id);
    if (index !== -1) {
      const antes = JSON.stringify(db.bairros[index]);
      db.bairros[index] = bairro;
      this.saveDb(db);
      this.log('usr-admin', 'Atualização de Bairro', 'Bairros', bairro.id, antes, JSON.stringify(bairro));
    }
  }

  public static addPaciente(paciente: Paciente) {
    const db = this.getDb();
    db.pacientes.push(paciente);
    // Auto-create standard User for patient
    const usr: Usuario = {
      id: `usr-pac-${paciente.id}`,
      municipioId: paciente.municipioId,
      nome: paciente.nome,
      email: paciente.email || `${paciente.cpf.replace(/\D/g, '')}@saude.gov.br`,
      telefone: paciente.telefone,
      cpf: paciente.cpf,
      perfil: 'paciente',
      status: 'ativo'
    };
    db.usuarios.push(usr);
    this.saveDb(db);
    this.log('usr-admin', 'Cadastro de Paciente', 'Pacientes', paciente.id, undefined, JSON.stringify(paciente));
  }

  public static updatePaciente(paciente: Paciente) {
    const db = this.getDb();
    const index = db.pacientes.findIndex(p => p.id === paciente.id);
    if (index !== -1) {
      const antes = JSON.stringify(db.pacientes[index]);
      db.pacientes[index] = paciente;
      this.saveDb(db);
      this.log('usr-unidade', 'Atualização de Paciente', 'Pacientes', paciente.id, antes, JSON.stringify(paciente));
    }
  }

  public static addUsuario(usuario: Usuario) {
    const db = this.getDb();
    db.usuarios.push(usuario);
    this.saveDb(db);
    this.log('usr-admin', 'Cadastro de Usuário', 'Usuarios', usuario.id, undefined, JSON.stringify(usuario));
  }

  public static updateUsuario(usuario: Usuario) {
    const db = this.getDb();
    const idx = db.usuarios.findIndex(u => u.id === usuario.id);
    if (idx !== -1) {
      db.usuarios[idx] = usuario;
      this.saveDb(db);
    }
  }

  public static addFuncionario(funcionario: Funcionario, cargoDetails?: any) {
    const db = this.getDb();
    db.funcionarios.push(funcionario);
    
    // Auto-create linked specialized profile
    if (funcionario.cargo.toLowerCase().includes('médico') || funcionario.cargo.toLowerCase().includes('medico')) {
      const m: Medico = {
        id: `med-${funcionario.id}`,
        funcionarioId: funcionario.id,
        crm: funcionario.registroProfissional,
        especialidade: funcionario.especialidade || 'Clínica Geral',
        unidadeId: funcionario.unidadeId,
        bairrosAtendidos: cargoDetails?.bairrosAtendidos || ['b-1'],
        diasAtendimento: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
        horarioInicio: '08:00',
        horarioFim: '17:00',
        status: 'ativo'
      };
      db.medicos.push(m);
    } else if (funcionario.cargo.toLowerCase().includes('dentista') || funcionario.cargo.toLowerCase().includes('odonto')) {
      const d: Dentista = {
        id: `dent-${funcionario.id}`,
        funcionarioId: funcionario.id,
        cro: funcionario.registroProfissional,
        especialidadeOdontologica: funcionario.especialidade || 'Clínica Geral',
        unidadeId: funcionario.unidadeId,
        diasAtendimento: ['Seg', 'Ter', 'Qua', 'Qui'],
        horarioInicio: '08:00',
        horarioFim: '17:00',
        status: 'ativo'
      };
      db.dentistas.push(d);
    } else if (funcionario.cargo.toLowerCase().includes('agente')) {
      const a: AgenteSaude = {
        id: `ag-${funcionario.id}`,
        funcionarioId: funcionario.id,
        unidadeId: funcionario.unidadeId,
        bairrosAtendidos: cargoDetails?.bairrosAtendidos || ['b-1'],
        microarea: cargoDetails?.microarea || 'Microárea Geral',
        status: 'ativo'
      };
      db.agentesSaude.push(a);
    }
    this.saveDb(db);
    this.log('usr-admin', 'Cadastro de Funcionário', 'Funcionarios', funcionario.id, undefined, JSON.stringify(funcionario));
  }

  public static addAgendamento(agendamento: Agendamento) {
    const db = this.getDb();
    // Calculate simple queue prefix
    const queueChar = agendamento.tipoProfissional === 'medico' ? 'M' : agendamento.tipoProfissional === 'dentista' ? 'O' : 'E';
    const num = db.agendamentos.filter(a => a.data === agendamento.data && a.tipoProfissional === agendamento.tipoProfissional).length + 101;
    agendamento.senhaFila = `${queueChar}-${num}`;
    
    db.agendamentos.push(agendamento);
    this.saveDb(db);
    
    // Add patient notification
    this.addNotificacao({
      id: `notif-${Date.now()}`,
      usuarioId: `usr-pac-${agendamento.pacienteId}`,
      titulo: 'Consulta Agendada',
      mensagem: `Seu agendamento para ${agendamento.tipoAtendimento.replace('_', ' ')} foi registrado para o dia ${agendamento.data} às ${agendamento.horario}.`,
      tipo: 'consulta',
      lida: false,
      dataEnvio: new Date().toISOString()
    });
    
    this.log('usr-admin', 'Criação de Agendamento', 'Agendamentos', agendamento.id, undefined, JSON.stringify(agendamento));
  }

  public static updateAgendamentoStatus(id: string, status: StatusAgendamento) {
    const db = this.getDb();
    const idx = db.agendamentos.findIndex(a => a.id === id);
    if (idx !== -1) {
      const antes = db.agendamentos[idx].status;
      db.agendamentos[idx].status = status;
      this.saveDb(db);
      this.log('usr-unidade', 'Atualização Status Agendamento', 'Agendamentos', id, antes, status);
    }
  }

  public static addTriagem(triagem: Triagem) {
    const db = this.getDb();
    db.triagens.push(triagem);
    // Update linked agendamento to 'em_triagem' or 'confirmado' / 'atendido' status based on flow
    const idx = db.agendamentos.findIndex(a => a.id === triagem.agendamentoId);
    if (idx !== -1) {
      db.agendamentos[idx].status = 'em_triagem';
    }
    this.saveDb(db);
    this.log('usr-enfermeiro', 'Registro de Triagem', 'Triagens', triagem.id, undefined, JSON.stringify(triagem));
  }

  public static addProntuarioMedico(prontuario: ProntuarioMedico) {
    const db = this.getDb();
    db.prontuariosMedicos.push(prontuario);
    // Update agendamento to 'atendido'
    const idx = db.agendamentos.findIndex(a => a.id === prontuario.agendamentoId);
    if (idx !== -1) {
      db.agendamentos[idx].status = 'atendido';
    }
    this.saveDb(db);
    this.log('usr-medico', 'Registro de Prontuário Médico', 'ProntuariosMedicos', prontuario.id, undefined, JSON.stringify(prontuario));
  }

  public static addProntuarioOdontologico(prontuario: ProntuarioOdontologico) {
    const db = this.getDb();
    db.prontuariosOdontologicos.push(prontuario);
    // Update agendamento to 'atendido'
    const idx = db.agendamentos.findIndex(a => a.id === prontuario.agendamentoId);
    if (idx !== -1) {
      db.agendamentos[idx].status = 'atendido';
    }
    this.saveDb(db);
    this.log('usr-dentista', 'Registro de Prontuário Odontológico', 'ProntuariosOdontologicos', prontuario.id, undefined, JSON.stringify(prontuario));
  }

  public static updateOdontograma(registro: OdontogramaRegistro) {
    const db = this.getDb();
    const idx = db.odontograma.findIndex(o => o.pacienteId === registro.pacienteId && o.dente === registro.dente);
    if (idx !== -1) {
      db.odontograma[idx] = registro;
    } else {
      db.odontograma.push(registro);
    }
    this.saveDb(db);
  }

  public static addProcedimentoOdontologico(procedimento: ProcedimentoOdontologico) {
    const db = this.getDb();
    db.procedimentosOdontologicos.push(procedimento);
    this.saveDb(db);
  }

  public static addReceita(receita: Receita) {
    const db = this.getDb();
    db.receitas.push(receita);
    this.saveDb(db);
    
    // Add patient notification
    this.addNotificacao({
      id: `notif-${Date.now()}`,
      usuarioId: `usr-pac-${receita.pacienteId}`,
      titulo: 'Nova Receita Emitida',
      mensagem: `Você recebeu uma nova receita médica/odontológica emitida em ${receita.dataEmissao}.`,
      tipo: 'medicamento',
      lida: false,
      dataEnvio: new Date().toISOString()
    });

    this.log(receita.profissionalId, 'Emissão de Receita', 'Receitas', receita.id, undefined, JSON.stringify(receita));
  }

  public static updateReceitaStatus(id: string, status: 'ativa' | 'dispensada' | 'vencida') {
    const db = this.getDb();
    const idx = db.receitas.findIndex(r => r.id === id);
    if (idx !== -1) {
      db.receitas[idx].status = status;
      this.saveDb(db);
    }
  }

  public static addExame(exame: Exame) {
    const db = this.getDb();
    db.exames.push(exame);
    this.saveDb(db);
  }

  public static updateExameResultado(id: string, obs: string, resultUrl: string) {
    const db = this.getDb();
    const idx = db.exames.findIndex(e => e.id === id);
    if (idx !== -1) {
      db.exames[idx].status = 'realizado';
      db.exames[idx].dataResultado = new Date().toISOString().split('T')[0];
      db.exames[idx].resultadoObservacao = obs;
      db.exames[idx].arquivoResultado = resultUrl;
      this.saveDb(db);
    }
  }

  public static addEncaminhamento(encaminhamento: Encaminhamento) {
    const db = this.getDb();
    db.encaminhamentos.push(encaminhamento);
    this.saveDb(db);
  }

  public static addCarteiraVacinacao(carteira: CarteiraVacinacao) {
    const db = this.getDb();
    db.carteiraVacinacao.push(carteira);
    this.saveDb(db);
  }

  public static addNotificacao(notif: Notificacao) {
    const db = this.getDb();
    db.notificacoes.unshift(notif);
    this.saveDb(db);
  }

  public static markNotificacaoLida(id: string) {
    const db = this.getDb();
    const idx = db.notificacoes.findIndex(n => n.id === id);
    if (idx !== -1) {
      db.notificacoes[idx].lida = true;
      this.saveDb(db);
    }
  }

  public static addOuvidoria(ticket: OuvidoriaTicket) {
    const db = this.getDb();
    db.ouvidoria.push(ticket);
    this.saveDb(db);
  }

  public static responderOuvidoria(id: string, resposta: string) {
    const db = this.getDb();
    const idx = db.ouvidoria.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.ouvidoria[idx].resposta = resposta;
      db.ouvidoria[idx].status = 'respondido';
      this.saveDb(db);
    }
  }

  public static atualizarEstoqueMedicamento(medicamentoId: string, novaQuantidade: number) {
    const db = this.getDb();
    const idx = db.estoqueMedicamentos.findIndex(e => e.medicamentoId === medicamentoId);
    if (idx !== -1) {
      db.estoqueMedicamentos[idx].quantidade = novaQuantidade;
      db.estoqueMedicamentos[idx].status = novaQuantidade === 0 ? 'esgotado' : 'ativo';
    } else {
      db.estoqueMedicamentos.push({
        id: `est-${Date.now()}`,
        unidadeId: 'unit-3',
        medicamentoId,
        quantidade: novaQuantidade,
        lote: 'L-2026A',
        validade: '2028-12-31',
        dataEntrada: new Date().toISOString().split('T')[0],
        status: 'ativo'
      });
    }
    this.saveDb(db);
  }

  public static entregarMedicamento(entrega: EntregaMedicamento) {
    const db = this.getDb();
    db.entregaMedicamentos.push(entrega);
    
    // Deduct stock quantity
    const estIdx = db.estoqueMedicamentos.findIndex(e => e.unidadeId === entrega.farmaciaId && e.medicamentoId === entrega.medicamentoId);
    if (estIdx !== -1) {
      db.estoqueMedicamentos[estIdx].quantidade = Math.max(0, db.estoqueMedicamentos[estIdx].quantidade - entrega.quantidadeEntregue);
      if (db.estoqueMedicamentos[estIdx].quantidade === 0) {
        db.estoqueMedicamentos[estIdx].status = 'esgotado';
      }
    }
    
    this.saveDb(db);
    this.log('usr-farmacia', 'Entrega de Medicamento', 'EntregaMedicamentos', entrega.id, undefined, JSON.stringify(entrega));
  }

  public static addMedicamento(med: Medicamento, estoqueInicial?: { unidadeId: string; quantidade: number; lote: string; validade: string }) {
    const db = this.getDb();
    db.medicamentos.push(med);
    if (estoqueInicial) {
      db.estoqueMedicamentos.push({
        id: `est-${Date.now()}`,
        unidadeId: estoqueInicial.unidadeId,
        medicamentoId: med.id,
        quantidade: estoqueInicial.quantidade,
        lote: estoqueInicial.lote,
        validade: estoqueInicial.validade,
        dataEntrada: new Date().toISOString().split('T')[0],
        status: 'ativo'
      });
    }
    this.saveDb(db);
    this.log('usr-admin', 'Cadastro de Medicamento', 'Medicamentos', med.id, undefined, JSON.stringify(med));
  }

  public static addNoticia(noticia: Noticia) {
    const db = this.getDb();
    db.noticias.unshift(noticia);
    this.saveDb(db);
  }

  public static addVisitaDomiciliar(visita: VisitaDomiciliar) {
    const db = this.getDb();
    db.visitasDomiciliares.push(visita);
    this.saveDb(db);
    this.log('usr-agente', 'Registro de Visita Domiciliar', 'VisitasDomiciliares', visita.id, undefined, JSON.stringify(visita));
  }

  public static addCampanha(camp: Campanha) {
    const db = this.getDb();
    db.campanhas.push(camp);
    this.saveDb(db);
  }

  // AUDIT LOG HELPER
  private static log(usrId: string, acao: string, tabela: string, regId: string, antes?: string, depois?: string) {
    const db = this.getDb();
    const logItem: LogAuditoria = {
      id: `log-${Date.now()}`,
      usuarioId: usrId,
      municipioId: 'mun-1',
      acao,
      tabelaAfetada: tabela,
      registroId: regId,
      dadosAntes: antes,
      dadosDepois: depois,
      ip: '192.168.1.15',
      dataHora: new Date().toISOString()
    };
    db.logsAuditoria.unshift(logItem);
    this.saveDb(db);
  }
}

// Trigger loading existing data from Back4App Parse in background on initial script load
loadFromParse();
