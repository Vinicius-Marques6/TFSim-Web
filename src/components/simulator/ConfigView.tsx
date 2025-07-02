import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Opcode } from "@/logic/types";
import { useSimulatorStore } from "@/store/simulatorStore";

// Adiciona as props open e setOpen
interface ConfigViewProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function ConfigView({ open, setOpen }: ConfigViewProps) {
  // Obtém config e função de atualização do store
  const config = useSimulatorStore((state) => state.config);
  const updateConfig = useSimulatorStore((state) => state.actions.updateConfig);

  const handleExecutionTimeChange = (
    opcode: string,
    value: string | number
  ) => {
    updateConfig({
      executionTimes: {
        ...config.executionTimes,
        [opcode]: Number(value),
      },
    });
  };

  const handleStationCountChange = (index: number, value: string | number) => {
    const updatedStations = config.reservationStations.map((station, idx) =>
      idx === index ? { ...station, count: Number(value) } : station
    );
    updateConfig({ reservationStations: updatedStations });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações do Simulador</DialogTitle>
          <DialogDescription>
            Ajuste as configurações do simulador conforme necessário.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">
              Tempos de Execução (ciclos)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Opcode).map((opcode) => (
                <label key={opcode} className="flex items-center gap-2">
                  <span className="w-14">{opcode}</span>
                  <input
                    type="number"
                    min="1"
                    value={config.executionTimes[opcode]}
                    onChange={(e) =>
                      handleExecutionTimeChange(opcode, e.target.value)
                    }
                    className="border rounded px-2 py-1 w-20"
                  />
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Estações de Reserva</h4>
            <div className="space-y-2">
              {config.reservationStations.map((station, idx) => (
                <div key={station.name} className="flex items-center gap-2">
                  <span className="w-20 font-medium">{station.name}</span>
                  <span className="text-xs text-gray-500">
                    [{station.type.join(", ")}]
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={station.count}
                    onChange={(e) =>
                      handleStationCountChange(idx, e.target.value)
                    }
                    className="border rounded px-2 py-1 w-16"
                  />
                  <span className="text-xs">unidades</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
