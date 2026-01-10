import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Simulado from "./pages/Simulado";
import Revisao from "./pages/Revisao";
import BancoQuestoes from "./pages/BancoQuestoes";
import APIPython from "./pages/APIPython";
import Estatisticas from "./pages/Estatisticas";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/simulado" element={<Simulado />} />
          <Route path="/revisao" element={<Revisao />} />
          <Route path="/banco" element={<BancoQuestoes />} />
          <Route path="/api-python" element={<APIPython />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
