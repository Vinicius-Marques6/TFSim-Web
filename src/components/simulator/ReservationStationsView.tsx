import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type ReservationStationEntry } from "@/logic/types";

interface Props {
  stations: ReservationStationEntry[] | undefined;
}

export function ReservationStationsView({ stations }: Props) {
  return (
    <div className="bg-white col-span-2 rounded-sm shadow-sm border overflow-auto">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Busy</TableHead>
            <TableHead>Op</TableHead>
            <TableHead>Vj</TableHead>
            <TableHead>Vk</TableHead>
            <TableHead>Qj</TableHead>
            <TableHead>Qk</TableHead>
            <TableHead>A</TableHead>
            <TableHead>Dest</TableHead>
            <TableHead>Tempo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stations?.map((s) => (
            <TableRow key={s.name}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.busy ? "Yes" : "No"}</TableCell>
              <TableCell>{s.op}</TableCell>
              <TableCell>{s.vj}</TableCell>
              <TableCell>{s.vk}</TableCell>
              <TableCell>{s.qj}</TableCell>
              <TableCell>{s.qk}</TableCell>
              <TableCell>{s.address ?? ""}</TableCell>
              <TableCell>{s.dest}</TableCell>
              <TableCell>{s.executionTimeLeft}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
