import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { parseProgram } from "@/logic/parser";

import { ReservationStationsView } from "./ReservationStationsView";
import { RegisterFileView } from "./RegisterFileView";
import { MemoryView } from "./MemoryView";
import { InstructionStatusView } from "./InstructionStatusView";
import { Editor } from "./Editor";
import { useEditorStore } from "@/store/editorStore";
import { useSimulatorStore } from "@/store/simulatorStore";
import { Hammer, StepForward } from "lucide-react";

export function SimulatorPage() {
  const { initialize, nextStep } = useSimulatorStore((state) => state.actions);
  const clock = useSimulatorStore((state) => state.clock);
  const hasStarted = useSimulatorStore((state) => state.reservationStations.length > 0);

  const handleLoadProgram = () => {
    const code = useEditorStore.getState().code;
    const instructions = parseProgram(code);
    console.log("Instruções carregadas:", instructions);
    const registers: Record<string, number> = {};

    const memory: Record<string, number> = {};
    for (let i = 0; i < 500; i++) {
      memory[i] = Math.floor(Math.random() * 100);
    }

    console.log(memory)
    
    initialize(instructions, registers, memory);
  };

  const handleNextStep = () => {
    if (hasStarted) {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="rounded-none border-b border-none px-2 lg:px-4 flex w-full z-10 bg-white border shadow-sm p-1 gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer" onClick={handleLoadProgram}>
              <Hammer />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Carregar Programa</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="cursor-pointer" onClick={handleNextStep} disabled={!hasStarted}>
              <StepForward />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Próximo ciclo</p>
          </TooltipContent>
        </Tooltip>
        <div className="ml-auto flex items-center">
          <span className="text-sm font-medium">
            Clock: {clock}
          </span>
        </div>
      </div>
      <div className="flex-1 p-1 sm:overflow-hidden">
        <div className="flex flex-col sm:grid sm:grid-cols-6 grid-rows-2 h-full gap-1">
          <div className="col-span-1 h-100 sm:h-full">
            <Editor />
          </div>
          <InstructionStatusView />
          <ReservationStationsView />
          <RegisterFileView />
          <MemoryView />
        </div>
      </div>
    </div>
  );
}
