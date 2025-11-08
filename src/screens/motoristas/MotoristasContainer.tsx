import React, { useState, useRef } from "react";
import ListaMotoristasScreen from "./ListaMotoristasScreen";
import CadastroMotoristaScreen from "./CadastroMotoristaScreen";
import { MotoristaCompleto } from "../../services/motoristasService";

type MotoristasView = "lista" | "cadastro" | "edicao";

export const MotoristasContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<MotoristasView>("lista");
  const [selectedMotorista, setSelectedMotorista] = useState<MotoristaCompleto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key para forçar recarga

  const handleNavigateToCadastro = () => {
    setSelectedMotorista(null);
    setCurrentView("cadastro");
  };

  const handleNavigateToEdit = (motorista: MotoristaCompleto) => {
    setSelectedMotorista(motorista);
    setCurrentView("edicao");
  };

  const handleBackToList = () => {
    setSelectedMotorista(null);
    setCurrentView("lista");
  };

  // Callback para invalidar/recarregar a lista após salvamento
  const handleRefreshAfterSave = () => {
    // Incrementar refresh key para forçar re-render da lista
    setRefreshKey(prev => prev + 1);
  };

  if (currentView === "cadastro") {
    return (
      <CadastroMotoristaScreen 
        onBack={handleBackToList}
        onSaveSuccess={handleRefreshAfterSave}
      />
    );
  }

  if (currentView === "edicao" && selectedMotorista) {
    return (
      <CadastroMotoristaScreen
        onBack={handleBackToList}
        motoristaToEdit={selectedMotorista}
        isEdit={true}
        onSaveSuccess={handleRefreshAfterSave}
      />
    );
  }

  return (
    <ListaMotoristasScreen 
      onNavigateToCadastro={handleNavigateToCadastro}
      onNavigateToEdit={handleNavigateToEdit}
    />
  );
};

export default MotoristasContainer;