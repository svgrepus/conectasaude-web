import React, { useState, useRef } from "react";
import { ListaMunicipesScreen, ListaMunicipesScreenRef } from "./ListaMunicipesScreen";
import { CadastroMunicipeScreen } from "./CadastroMunicipeScreen";
import { Municipe } from "../../types";
import { navigate } from "../../navigation/navigationService";

type MunicipesView = "lista" | "cadastro" | "edicao";

export const MunicipesContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<MunicipesView>("lista");
  const [selectedMunicipe, setSelectedMunicipe] = useState<Municipe | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0); // Key para forçar recarga
  
  // Ref para acessar a função de reload da lista
  const listScreenRef = useRef<ListaMunicipesScreenRef>(null);

  const handleNavigateToCadastro = () => {
    setSelectedMunicipe(null);
    setCurrentView("cadastro");
  };

  const handleNavigateToEdit = (municipe: Municipe) => {
    console.log("Navigating to edit municipe with ID:", municipe.id);
    navigate("MunicipeDetail", { id: municipe.id, mode: "edit" });
  };

  const handleBackToList = () => {
    setSelectedMunicipe(null);
    setCurrentView("lista");
  };

  // Callback para invalidar/recarregar a lista após salvamento
  const handleRefreshAfterSave = () => {
    console.log("🔄 MunicipesContainer: Iniciando processo de atualização da lista...");
    
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
    console.log("🔧 MunicipesContainer: Renderizando tela de cadastro com callback");
    return (
      <CadastroMunicipeScreen 
        onBack={handleBackToList}
        onSaveSuccess={handleRefreshAfterSave} // ✅ Adicionar callback
      />
    );
  }

  if (currentView === "edicao" && selectedMunicipe) {
    console.log("🔧 MunicipesContainer: Renderizando tela de edição com callback");
    return (
      <CadastroMunicipeScreen
        onBack={handleBackToList}
        municipeToEdit={selectedMunicipe}
        onSaveSuccess={handleRefreshAfterSave} // ✅ Adicionar callback
      />
    );
  }

  return (
    <ListaMunicipesScreen
      key={refreshKey} // ✅ Key que força re-render completo
      ref={listScreenRef}
      onNavigateToCadastro={handleNavigateToCadastro}
      onNavigateToEdit={handleNavigateToEdit}
    />
  );
};
