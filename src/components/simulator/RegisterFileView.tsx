import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type RegisterState } from "@/logic/types";

interface Props {
  registers?: Record<string, RegisterState>;
}

export function RegisterFileView({ registers }: Props) {
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
            <TableHead className="bg-muted sticky top-0">Registrador</TableHead>
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
