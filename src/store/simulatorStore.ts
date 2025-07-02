import { create } from "zustand";
import type {
  ExecutionTimeConfig,
  Instruction,
  InstructionStatus,
  ReservationStationConfig,
  ReservationStationEntry,
  SimulationState,
  SimulatorConfig,
} from "@/logic/types";
import { Opcode } from "@/logic/types";
import { produce } from "immer";

const DEFAULT_EXECUTION_TIMES: ExecutionTimeConfig = {
  [Opcode.LW]: 2,
  [Opcode.SW]: 1,
  [Opcode.ADD]: 2,
  [Opcode.SUB]: 2,
  [Opcode.MUL]: 8,
  [Opcode.DIV]: 8,
  [Opcode.ADDI]: 1,
};

const DEFAULT_RESERVATION_STATIONS_CONFIG: ReservationStationConfig[] = [
  { name: "Add", type: [Opcode.ADD, Opcode.SUB], count: 3 },
  { name: "Mul", type: [Opcode.MUL, Opcode.DIV], count: 2 },
  { name: "Load", type: [Opcode.LW, Opcode.SW], count: 2 },
  { name: "Imm", type: [Opcode.ADDI], count: 2 },
];

const REGISTER_COUNT = 32;

interface SimulatorStoreState extends SimulationState {
  instructionStatus: InstructionStatus[];
  config: SimulatorConfig;
  actions: {
    initialize: (
      instructions: Instruction[],
      registers: Record<string, number>,
      memory: Record<string, number>,
      config?: Partial<SimulatorConfig>
    ) => void;
    updateConfig: (config: Partial<SimulatorConfig>) => void;
    nextStep: () => void;
  };
}

const initializeState = (
  instructions: Instruction[],
  registersNames: Record<string, number>,
  memory: Record<string, number>,
  config: SimulatorConfig
): SimulationState => {
  // Cria registradores (R0 a R31 por padrão), inicializando com 0
  const registerFile: Record<string, { value: number; qi: string | null }> = {};
  for (let i = 0; i < REGISTER_COUNT; i++) {
    const regName = `R${i}`;
    registerFile[regName] = { value: 0, qi: null };
  }
  // Sobrescreve valores informados em registersNames
  Object.entries(registersNames).forEach(([name, value]) => {
    if (registerFile[name]) {
      registerFile[name].value = value;
    }
  });

  const reservationStations: ReservationStationEntry[] = [];
  config.reservationStations.forEach((configStation) => {
    for (let i = 1; i <= configStation.count; i++) {
      reservationStations.push({
        name: `${configStation.name}${i}`,
        busy: false,
        op: null,
        vj: null,
        vk: null,
        qj: null,
        qk: null,
        dest: null,
        executionTimeLeft: null,
        address: null,
        instructionId: null,
      });
    }
  });

  return { clock: 0, instructions, reservationStations, registerFile, memory };
};

export const useSimulatorStore = create<SimulatorStoreState>((set, get) => ({
  // Estado Inicial
  clock: 0,
  instructions: [],
  reservationStations: [],
  registerFile: {},
  memory: {},
  instructionStatus: [],
  config: {
    executionTimes: DEFAULT_EXECUTION_TIMES,
    reservationStations: DEFAULT_RESERVATION_STATIONS_CONFIG
  },

  // Ações que modificam o estado
  actions: {
    initialize: (instructions, registers, memory) => {
      set({
        ...initializeState(instructions, registers, memory, get().config),
        instructionStatus: instructions.map((instruction) => ({
          instruction,
          issue: null,
          executionStart: null,
          executionEnd: null,
          writeResult: null,
        })),
      });
    },

    updateConfig: (configOverrides) => {
      const currentState = get();
      const newConfig = {
        executionTimes: { ...currentState.config.executionTimes, ...configOverrides.executionTimes },
        reservationStations: configOverrides.reservationStations || currentState.config.reservationStations,
      };
      
      set({ config: newConfig });
    },

    nextStep: () =>
      set(
        produce((state: SimulatorStoreState) => {
          // Fases do ciclo do simulador
          writeResultPhase(state);
          executePhase(state);
          issuePhase(state);
          state.clock += 1;
        })
      ),
  },
}));

/**
 * Fase de Emissão (Issue)
 * - Pega a próxima instrução da fila.
 * - Encontra uma Estação de Reserva (ER) vaga do tipo correto.
 * - Se não houver ER vaga, para (hazard estrutural).
 * - Copia os operandos para a ER. Se um operando não estiver pronto,
 *   rastreia a ER que o produzirá (renomeação de registradores).
 * - Atualiza o arquivo de registradores para apontar para a nova ER.
 */
function issuePhase(state: SimulatorStoreState) {
  if (state.instructions.length === 0) return;

  const instruction = state.instructions[0];
  const stationTypeConfig = state.config.reservationStations.find((c) =>
    c.type.includes(instruction.op)
  );
  if (!stationTypeConfig) return;

  const station = state.reservationStations.find(
    (rs) => rs.name.startsWith(stationTypeConfig.name) && !rs.busy
  );
  if (!station) return;

  // Ocupa a estação
  station.busy = true;
  station.op = instruction.op;

  station.instructionId = instruction.id; // Armazena o ID da instrução

  console.log(
    `Emissão da instrução: ${instruction.op} para a estação ${station.name}`
  );

  // Lógica para tratar diferentes tipos de instrução
  switch (instruction.op) {
    case Opcode.ADD:
    case Opcode.SUB:
    case Opcode.MUL:
    case Opcode.DIV: {
      // Operações R-Type (ADD Rd, Rs, Rt)
      // operand1 = Rs, operand2 = Rt
      const regSource1 = state.registerFile[instruction.operand1];
      if (regSource1 && regSource1.qi) {
        station.qj = regSource1.qi;
      } else {
        station.vj = regSource1 ? regSource1.value : 0;
        station.qj = null;
      }

      const regSource2 = state.registerFile[instruction.operand2];
      if (regSource2 && regSource2.qi) {
        station.qk = regSource2.qi;
      } else {
        station.vk = regSource2 ? regSource2.value : 0;
        station.qk = null;
      }

      // Atualiza o registrador de destino
      if (state.registerFile[instruction.dest]) {
        state.registerFile[instruction.dest].qi = station.name;
      }
      station.dest = instruction.dest;
      break;
    }
    case Opcode.LW:
    case Opcode.SW: {
      // Formato: OP Rd, offset(Rs)
      // operand1 = offset, operand2 = Rs (registrador base)
      // dest = Rd para LW, Rt para SW (registrador com o dado)

      // Pega o valor do registrador base (Rs)
      const baseRegister = state.registerFile[instruction.operand2];
      if (baseRegister && baseRegister.qi) {
        station.qj = baseRegister.qi; // Dependência do registrador base
      } else {
        // O valor do registrador base é colocado em Vj para o cálculo do endereço
        station.vj = baseRegister ? baseRegister.value : 0;
        station.qj = null;
      }

      // O offset é tratado como um valor imediato e armazenado em address
      station.address = parseInt(instruction.operand1, 10);
      station.vk = null;
      station.qk = null;

      if (instruction.op === Opcode.LW) {
        // Atualiza o registrador de destino (Rd)
        if (state.registerFile[instruction.dest]) {
          state.registerFile[instruction.dest].qi = station.name;
        }
        station.dest = instruction.dest;
      } else {
        // SW
        // Para SW, o registrador de destino da instrução (dest) é a fonte do dado
        const sourceRegister = state.registerFile[instruction.dest];
        if (sourceRegister && sourceRegister.qi) {
          // O valor a ser armazenado depende de outra estação
          station.qk = sourceRegister.qi;
        } else {
          // O valor a ser armazenado está pronto
          station.vk = sourceRegister ? sourceRegister.value : 0;
          station.qk = null;
        }
        // SW não tem registrador de destino no register file, o destino é a memória
        station.dest = null;
      }
      break;
    }
    case Opcode.ADDI: {
      // Formato: ADDI Rd, Rs, immediate
      // operand1 = Rs, operand2 = immediate
      const regSource = state.registerFile[instruction.operand1];
      if (regSource && regSource.qi) {
        station.qj = regSource.qi;
      } else {
        station.vj = regSource ? regSource.value : 0;
        station.qj = null;
      }

      station.vk = parseInt(instruction.operand2, 10);
      station.qk = null;

      // Atualiza o registrador de destino
      if (state.registerFile[instruction.dest]) {
        state.registerFile[instruction.dest].qi = station.name;
      }
      station.dest = instruction.dest;
      break;
    }
  }

  // Remove a instrução da fila de emissão
  const issuedInstruction = state.instructions.shift();

  const issuedInstructionStatus = state.instructionStatus.find(
    (s) => s.instruction.id === issuedInstruction?.id && s.issue === null
  );
  if (issuedInstructionStatus) {
    issuedInstructionStatus.issue = state.clock + 1; // O clock será incrementado no final
  }
}

/**
 * Fase de Execução (Execute)
 * - Itera sobre as ERs ocupadas.
 * - Se uma ER tem todos os operandos (Vj, Vk prontos), inicia a execução.
 * - Para LW/SW, primeiro calcula o endereço de memória.
 * - Para outras operações, começa a contagem de tempo de execução.
 * - Se uma ER já está em execução, decrementa seu contador de tempo.
 */
function executePhase(state: SimulatorStoreState) {
  for (const station of state.reservationStations) {
    if (!station.busy || station.qj !== null || station.qk !== null) continue;

    // Se a execução ainda não começou, inicie-a
    if (station.executionTimeLeft === null) {
      const instructionStatus = state.instructionStatus.find(
        (s) => s.instruction.id === station.instructionId && s.executionStart === null
      );
      if (instructionStatus) {
        instructionStatus.executionStart = state.clock + 1; // O clock será incrementado no final
      }

      switch (station.op) {
        case Opcode.LW:
        case Opcode.SW: {
          // Para LW/SW, o primeiro passo é calcular o endereço
          // Assumimos que o cálculo do endereço leva 1 ciclo.
          station.address = (station.vj ?? 0) + (station.address ?? 0);
          station.executionTimeLeft = state.config.executionTimes[station.op];
          break;
        }
        case Opcode.ADD:
        case Opcode.SUB:
        case Opcode.MUL:
        case Opcode.DIV:
        case Opcode.ADDI: {
          station.executionTimeLeft = state.config.executionTimes[station.op];
          break;
        }
      }
    }

    // Se a estação está em processo de execução, decremente o contador
    if (station.executionTimeLeft !== null && station.executionTimeLeft > 0) {
      station.executionTimeLeft--;

      if (station.executionTimeLeft === 0) {
        const instructionStatus = state.instructionStatus.find(
          (s) => s.instruction.id === station.instructionId && s.executionEnd === null
        );
        if (instructionStatus) {
          instructionStatus.executionEnd = state.clock + 1; // A execução termina no final do próximo ciclo
        }
      }
    }
  }
}

/**
 * Fase de Escrita de Resultado (Write Result)
 * - Encontra ERs que terminaram a execução (tempo = 0).
 * - Simula o CDB: apenas uma ER pode escrever por ciclo.
 * - Calcula o resultado. LW/SW acessam a memória.
 * - Transmite o resultado para o arquivo de registradores e outras ERs.
 * - Libera a ER que escreveu o resultado.
 */
function writeResultPhase(state: SimulatorStoreState) {
  const stationToWrite = state.reservationStations.find(
    (s) => s.busy && s.executionTimeLeft === 0
  );

  if (!stationToWrite) return;

  let result: number | null = null;
  switch (stationToWrite.op) {
    case Opcode.ADD:
    case Opcode.ADDI:
      // Para ADDI, o Vk é um valor imediato, não um registrador
      result = (stationToWrite.vj ?? 0) + (stationToWrite.vk ?? 0);
      break;
    case Opcode.SUB:
      result = (stationToWrite.vj ?? 0) - (stationToWrite.vk ?? 0);
      break;
    case Opcode.MUL:
      result = (stationToWrite.vj ?? 0) * (stationToWrite.vk ?? 0);
      break;
    case Opcode.DIV:
      result =
        stationToWrite.vk === 0
          ? Infinity
          : (stationToWrite.vj ?? 0) / (stationToWrite.vk ?? 0);
      break;
    case Opcode.LW:
      result = state.memory[stationToWrite.address ?? -1] ?? 0; // Padrão para 0 se o endereço for inválido
      break;
    case Opcode.SW:
      if (stationToWrite.address !== null) {
        // Para SW, o valor a ser armazenado foi colocado em Vk durante a emissão
        state.memory[stationToWrite.address] = stationToWrite.vk ?? 0;
      }
      break;
  }

  const stationName = stationToWrite.name;

  // Transmite o resultado no CDB (se não for um SW)
  if (stationToWrite.op !== Opcode.SW && result !== null) {
    // Atualiza o arquivo de registradores
    if (
      stationToWrite.dest &&
      state.registerFile[stationToWrite.dest]?.qi === stationName
    ) {
      state.registerFile[stationToWrite.dest].value = result;
      state.registerFile[stationToWrite.dest].qi = null;
    }

    // Atualiza todas as estações de reserva que esperam por este resultado
    for (const station of state.reservationStations) {
      if (station.qj === stationName) {
        station.vj = result;
        station.qj = null;
      }
      if (station.qk === stationName) {
        station.vk = result;
        station.qk = null;
      }
    }
  }

  // Libera a estação de reserva
  stationToWrite.busy = false;
  stationToWrite.op = null;
  stationToWrite.vj = null;
  stationToWrite.vk = null;
  stationToWrite.qj = null;
  stationToWrite.qk = null;
  stationToWrite.address = null;
  stationToWrite.dest = null;
  stationToWrite.executionTimeLeft = null;

  const instruction = state.instructionStatus.find(
    (s) => s.executionEnd !== null && s.writeResult === null
  )?.instruction;
  if (!instruction) return;
  const instructionStatus = state.instructionStatus.find(
    (s) => s.instruction === instruction && s.writeResult === null
  );
  if (instructionStatus) {
    instructionStatus.writeResult = state.clock + 1;
  }
}
