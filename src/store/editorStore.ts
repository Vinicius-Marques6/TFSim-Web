import { create } from "zustand";

export const useEditorStore = create<{
  code: string;
  setCode: (code: string) => void;
}>((set) => ({
  code: `SW R3,100(R14)
LW  R11,200(R2)
LW  R15,96(R19)
LW  R30,12(R6)
LW  R19,60(R16)
ADD   R6,R2,R3
SUB   R2,R8,R0
DIV   R10,R8,R9
SW R10,100(R2)
MUL   R20,R14,R19
ADD   R3,R4,R4
SUB   R2,R9,R8
SW R2,100(R0)
SW R7,116(R0)
SW R10,228(R0)`,
  setCode: (code) => set({ code }),
}));