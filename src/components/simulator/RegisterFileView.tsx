import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type RegisterState } from "@/logic/types";
import { useSimulatorStore } from "@/store/simulatorStore";

export function RegisterFileView() {
  const registers = useSimulatorStore((state) => state.registerFile);

  const registerEntries = Array.from({ length: 32 }, (_, i) => {
    const name = `R${i}`;
    return [name, registers?.[name] ?? { qi: "", value: 0 }] as [
      string,
      RegisterState
    ];
  });

  return (
    <div className="bg-white border rounded-sm shadow col-start-6 row-span-2 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted sticky top-0">Reg</TableHead>
            <TableHead className="bg-muted sticky top-0">Qi</TableHead>
            <TableHead className="bg-muted sticky top-0">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registerEntries.map(([name, state]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell>{state.qi}</TableCell>
              <TableCell>{state.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
