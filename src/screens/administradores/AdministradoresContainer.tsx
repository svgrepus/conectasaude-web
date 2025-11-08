import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { AdminUser } from "../../services/administradoresService";

// Importações dinâmicas para evitar problemas de dependência
import ListaAdministradoresScreen from "./ListaAdministradoresScreen";
import CadastroAdministradorScreen from "./CadastroAdministradorScreen";

type AdministradoresView = "lista" | "cadastro" | "edicao";

export const AdministradoresContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdministradoresView>("lista");
  const [selectedAdministrador, setSelectedAdministrador] = useState<AdminUser | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  console.log("🔄 AdministradoresContainer: Renderizado - currentView:", currentView, "refreshKey:", refreshKey);

  // Força refresh quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 AdministradoresContainer: Tela recebeu foco");
      if (currentView === "lista") {
        console.log("🔄 AdministradoresContainer: Incrementando refreshKey para forçar atualização");
        setRefreshKey(prev => prev + 1);
      }
    }, [currentView])
  );

  const handleNavigateToCadastro = () => {
    setSelectedAdministrador(null);
    setCurrentView("cadastro");
  };

  const handleNavigateToEdit = (administrador: AdminUser) => {
    setSelectedAdministrador(administrador);
    setCurrentView("edicao");
  };

  const handleBackToList = () => {
    console.log("🔄 AdministradoresContainer: handleBackToList chamado");
    setSelectedAdministrador(null);
    setCurrentView("lista");
    setRefreshKey(prev => prev + 1);
  };

  if (currentView === "cadastro") {
    return (
      <CadastroAdministradorScreen 
        onBack={handleBackToList}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  if (currentView === "edicao" && selectedAdministrador) {
    return (
      <CadastroAdministradorScreen
        onBack={handleBackToList}
        administradorToEdit={selectedAdministrador}
        isEdit={true}
        onSaveSuccess={handleBackToList}
      />
    );
  }

  return (
    <ListaAdministradoresScreen 
      key={refreshKey}
      refreshTrigger={refreshKey}
      onNavigateToCadastro={handleNavigateToCadastro}
      onNavigateToEdit={handleNavigateToEdit}
    />
  );
};

export default AdministradoresContainer;