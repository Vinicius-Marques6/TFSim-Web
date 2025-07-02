// Tipos de operações que o processador pode executar
export type Opcode = 'LW' | 'SW' | 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'ADDI';

export const Opcode = {
  LW: 'LW',
  SW: 'SW',
  ADD: 'ADD',
  SUB: 'SUB',
  MUL: 'MUL',
  DIV: 'DIV',
  ADDI: 'ADDI',
} as const;

// Representa uma única instrução de assembly
export interface Instruction {
  id: string;        // Identificador único da instrução
  op: Opcode;
  dest: string;       // Registrador de destino (Rd) ou registrador fonte para SW (Rt)
  operand1: string;   // Registrador fonte (Rs) ou offset para LW/SW
  operand2: string;   // Registrador fonte (Rt) ou registrador base para LW/SW
}

// Representa o estado de execução de uma única instrução, rastreando o ciclo de clock de cada estágio do pipeline.
export interface InstructionStatus {
  instruction: Instruction;
  issue: number | null;         // Ciclo de clock em que a instrução foi emitida
  executionStart: number | null;// Ciclo de clock em que a execução começou
  executionEnd: number | null;  // Ciclo de clock em que a execução terminou
  writeResult: number | null;   // Ciclo de clock em que o resultado foi escrito
}

// Estado de um registrador no Arquivo de Registradores
export interface RegisterState {
  value: number | null; // Valor do registrador
  qi: string | null;    // Nome da Estação de Reserva que produzirá o valor
}

// Entrada em uma Estação de Reserva
export interface ReservationStationEntry {
  name: string;       // Nome da estação (e.g., "Add1", "Mult2")
  busy: boolean;      // Se a estação está em uso
  op: Opcode | null;  // Operação a ser executada

  // Valores dos operandos
  vj: number | null;
  vk: number | null;

  // Estações de Reserva que produzirão os operandos
  qj: string | null;
  qk: string | null;

  dest: string | null; // Tag do registrador de destino
  
  // Tempo restante para a conclusão da execução
  executionTimeLeft: number | null;

  // Endereço de memória calculado para LW/SW
  address: number | null;

  instructionId: string | null; // ID da instrução associada
}

// Configuração de tempos de execução customizáveis
export interface ExecutionTimeConfig {
  [Opcode.LW]: number;
  [Opcode.SW]: number;
  [Opcode.ADD]: number;
  [Opcode.SUB]: number;
  [Opcode.MUL]: number;
  [Opcode.DIV]: number;
  [Opcode.ADDI]: number;
}

// Configuração de estações de reserva customizável
export interface ReservationStationConfig {
  name: string;
  type: Opcode[];
  count: number;
}

// Configuração completa do simulador
export interface SimulatorConfig {
  executionTimes: ExecutionTimeConfig;
  reservationStations: ReservationStationConfig[];
}

// Representa o estado completo do simulador
export interface SimulationState {
  clock: number;
  instructions: Instruction[];
  reservationStations: ReservationStationEntry[];
  registerFile: Record<string, RegisterState>;
  memory: Record<string, number>;
}
