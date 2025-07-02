import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSimulatorStore } from "@/store/simulatorStore";
import { memo } from "react";

const TOTAL_ADDRESSES = 500;
const NUM_COLS = 50;
const NUM_ROWS = TOTAL_ADDRESSES / NUM_COLS;

interface MemoryCellProps {
  address: number;
  highlight: boolean;
}

const MemoryCell = memo(({ address, highlight }: MemoryCellProps) => {
  const value = useSimulatorStore((state) => state.memory[address] ?? 0);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TableCell
          className={`w-16 text-center border-b ${highlight ? 'bg-yellow-200 animate-pulse' : ''}`}
        >
          {value}
        </TableCell>
      </TooltipTrigger>
      <TooltipContent>
        <p>Endereço: {address}</p>
      </TooltipContent>
    </Tooltip>
  );
});
MemoryCell.displayName = "MemoryCell";

export function MemoryView() {
  const lastMemoryWrite = useSimulatorStore((state) => state.lastMemoryWrite);
  const clock = useSimulatorStore((state) => state.clock);

  return (
    <div className="bg-white border rounded-sm shadow col-span-5 overflow-auto">
      <Table className="border-separate border-spacing-0">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-20 bg-muted text-center font-bold sticky left-0 border-r border-b">
              Endereço
            </TableHead>
            {Array.from({ length: NUM_COLS }, (_, i) => (
              <TableHead key={i} className="w-16 text-center font-bold border-b">
                {i}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: NUM_ROWS }, (_, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="w-20 text-center font-bold sticky left-0 bg-muted z-1 border-r border-b">
                {rowIndex * NUM_COLS}
              </TableCell>
              {Array.from({ length: NUM_COLS }, (_, colIndex) => {
                const address = rowIndex * NUM_COLS + colIndex;
                const highlight = !!lastMemoryWrite && lastMemoryWrite.address === address && lastMemoryWrite.clock === clock;
                return <MemoryCell key={address} address={address} highlight={highlight} />;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
