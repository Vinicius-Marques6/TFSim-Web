import { type Instruction, Opcode } from "@/logic/types";
/*
 * Converte uma única linha de código assembly em um objeto Instruction.
 * Formatos esperados:
 * - ADD Rd, Rs, Rt
 * - SUB Rd, Rs, Rt
 * - MUL Rd, Rs, Rt
 * - DIV Rd, Rs, Rt
 * - LW Rd, offset(Rs)
 * - SW Rt, offset(Rs)
 */
export function parseInstruction(line: string): Instruction | null {
  const parts = line.trim().split(/[\s,()]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const op = parts[0].toUpperCase() as Opcode;
  if (!Object.values(Opcode).includes(op)) return null;
  try {
    switch (op) {
      case Opcode.ADD:
      case Opcode.SUB:
      case Opcode.MUL:
      case Opcode.DIV:
        if (parts.length !== 4) return null;
        return { id: crypto.randomUUID(), op, dest: parts[1], operand1: parts[2], operand2: parts[3] };
      case Opcode.LW:
        if (parts.length !== 4) return null;
        return { id: crypto.randomUUID(), op, dest: parts[1], operand1: parts[2], operand2: parts[3] };
      case Opcode.SW:
        if (parts.length !== 4) return null;
        // Para SW, a fonte é `dest` e a base é `operand2`
        return { id: crypto.randomUUID(), op, dest: parts[1], operand1: parts[2], operand2: parts[3] };
      default:
        return null;
    }
  } catch (e) {
    console.error("Erro ao analisar a instrução:", line, e);
    return null;
  }
}
/**
 * Converte um bloco de código assembly em uma lista de instruções.
 */
export function parseProgram(code: string): Instruction[] {
  return code
    .split("\n")
    .map((line) => parseInstruction(line))
    .filter((instr): instr is Instruction => instr !== null);
}
