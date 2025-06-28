import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSimulatorStore } from "@/store/simulatorStore";



export function InstructionStatusView() {
  const instructionStatus = useSimulatorStore(
    (state) => state.instructionStatus
  );

  return (
    <div className="bg-white col-span-2 rounded-sm shadow-sm border overflow-auto">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="bg-muted sticky top-0">Instruction</TableHead>
            <TableHead className="bg-muted sticky top-0">Issue</TableHead>
            <TableHead className="bg-muted sticky top-0">Execution</TableHead>
            <TableHead className="bg-muted sticky top-0">Write Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructionStatus.map((status, index) => (
            <TableRow key={index}>
              <TableCell>{`${status.instruction.op} ${status.instruction.dest}, ${status.instruction.operand1}, ${status.instruction.operand2}`}</TableCell>
              <TableCell>{status.issue}</TableCell>
              <TableCell>
                {`${status.executionStart ? status.executionStart: ''} - ${status.executionEnd ? status.executionEnd : ''}`}
              </TableCell>
              <TableCell>{status.writeResult}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
