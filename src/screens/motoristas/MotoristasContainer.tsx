import React, { useState, useRef } from "react";
import { ListaMotoristasScreen, ListaMotoristasScreenRef } from "./ListaMotoristasScreen";
import CadastroMotoristaScreen from "./CadastroMotoristaScreen";
import { MotoristaCompleto } from "../../services/motoristasService";

type MotoristasView = "lista" | "cadastro" | "edicao";

export const MotoristasContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<MotoristasView>("lista");
  const [selectedMotorista, setSelectedMotorista] = useState<MotoristaCompleto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key para forçar recarga
  
  // Ref para acessar a função de reload da lista
  const listScreenRef = useRef<ListaMotoristasScreenRef>(null);

  const handleNavigateToCadastro = () => {
    setSelectedMotorista(null);
    setCurrentView("cadastro");
  };

  const handleNavigateToEdit = (motorista: MotoristaCompleto) => {
    console.log("Navigating to edit motorista with ID:", motorista.motorista.id);
    setSelectedMotorista(motorista);
    setCurrentView("edicao");
  };

  const handleBackToList = () => {
    setSelectedMotorista(null);
    setCurrentView("lista");
  };

  // Callback para invalidar/recarregar a lista após salvamento
  const handleRefreshAfterSave = () => {
    console.log("🔄 MotoristasContainer: Iniciando processo de atualização da lista...");
    
    // Incrementar refresh key para forçar re-render da lista
    setRefreshKey(prev => {
      const newKey = prev + 1;
      console.log("🔄 Atualizando refreshKey:", prev, "->", newKey);
      return newKey;
    });
    
    // Também tentar via ref se disponível
    if (listScreenRef.current) {
      console.log("🔄 Chamando reloadData via ref...");
      listScreenRef.current.reloadData();
    }
  };

  if (currentView === "cadastro") {
    console.log("🔧 MotoristasContainer: Renderizando tela de cadastro com callback");
    return (
      <CadastroMotoristaScreen 
        onBack={handleBackToList}
        onSaveSuccess={handleRefreshAfterSave} // ✅ Adicionar callback
      />
    );
  }

  if (currentView === "edicao" && selectedMotorista) {
    console.log("🔧 MotoristasContainer: Renderizando tela de edição com callback");
    return (
      <CadastroMotoristaScreen
        onBack={handleBackToList}
        motoristaToEdit={selectedMotorista}
        isEdit={true}
        onSaveSuccess={handleRefreshAfterSave} // ✅ Adicionar callback
      />
    );
  }

  return (
    <ListaMotoristasScreen
      key={refreshKey} // ✅ Key que força re-render completo
      ref={listScreenRef}
      onNavigateToCadastro={handleNavigateToCadastro}
      onNavigateToEdit={handleNavigateToEdit}
    />
  );
};

export default MotoristasContainer;