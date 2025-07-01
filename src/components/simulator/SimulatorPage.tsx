import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { parseProgram } from "@/logic/parser";
import { useEditorStore } from "@/store/editorStore";
import { useSimulatorStore } from "@/store/simulatorStore";

import { ReservationStationsView } from "./ReservationStationsView";
import { RegisterFileView } from "./RegisterFileView";
import { MemoryView } from "./MemoryView";
import { InstructionStatusView } from "./InstructionStatusView";
import { Editor } from "./Editor";

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

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.asm,.s,.sim';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          useEditorStore.getState().setCode(content);
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }

  const handleSaveFile = () => {
    const content = useEditorStore.getState().code;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "program.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="rounded-none border-b border-none px-2 lg:px-4 flex w-full z-10 bg-white border shadow-sm p-1 gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="cursor-pointer px-2">
              Arquivo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-38" align="start">
            <DropdownMenuItem onClick={handleOpenFile}>
              Abrir arquivo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveFile}>
              Salvar arquivo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
