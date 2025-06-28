import { SimulatorPage } from "@/components/simulator/SimulatorPage";
import './App.css';
import { TooltipProvider } from "@radix-ui/react-tooltip";

function App() {
  return (
    <TooltipProvider>  
      <main>
        <SimulatorPage />
      </main>
    </TooltipProvider>
  );
}

export default App;
