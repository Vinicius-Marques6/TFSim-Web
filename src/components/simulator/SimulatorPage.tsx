import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TomasuloSimulator } from "@/logic/simulator";
import { parseProgram } from "@/logic/parser";
import { type InstructionStatus, type SimulationState } from "@/logic/types";

// Importe os componentes de visualização que vamos criar
import { ReservationStationsView } from "./ReservationStationsView";
import { RegisterFileView } from "./RegisterFileView";
import { MemoryView } from "./MemoryView";
import { InstructionStatusView } from "./InstructionStatusView";
import { Editor } from "./Editor";
import { useEditorStore } from "@/store/editorStore";

export function SimulatorPage() {
  const [simulator, setSimulator] = useState<TomasuloSimulator | null>(null);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [instructionStatus, setInstructionStatus] = useState<InstructionStatus[]>([]);

  const handleLoadProgram = () => {
    const code = useEditorStore.getState().code;
    const instructions = parseProgram(code);
    console.log("Instruções carregadas:", instructions);
    const registers = Array.from({ length: 32 }, (_, i) => `R${i}`);
    const memory: Record<string, number> = {};
    for (let i = 0; i < 500; i++) {
      memory[i] = Math.floor(Math.random() * 100);
    }
    const sim = new TomasuloSimulator(instructions, registers, memory);
    setSimulator(sim);
    setSimState(sim.getState());
    setInstructionStatus(sim.getInstructionStatus());
  };

  const handleNextStep = () => {
    if (simulator) {
      setSimState(simulator.nextStep());
      setInstructionStatus(simulator.getInstructionStatus());
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="rounded-none border-b border-none px-2 lg:px-4 flex bg-white border shadow-sm p-1 gap-1">
        <Button variant="ghost" className="cursor-pointer" onClick={handleLoadProgram}>Começar</Button>
        <Button variant="ghost" className="cursor-pointer" onClick={handleNextStep} disabled={!simulator}>Próximo ciclo</Button>
        <div className="ml-auto flex items-center">
          <span className="text-sm font-medium">
            Clock: {simState?.clock ?? 0}
          </span>
        </div>
      </div>
      <div className="flex-1 p-1 overflow-hidden">
        <div className="grid grid-cols-6 grid-rows-2 h-full gap-1">
          <div className="col-span-1">
            <Editor />
          </div>
          <InstructionStatusView instructionStatus={instructionStatus} />
          <ReservationStationsView stations={simState?.reservationStations} />
          <RegisterFileView registers={simState?.registerFile} />
          <MemoryView memory={simState?.memory} />
        </div>
      </div>
    </div>
  );
}
