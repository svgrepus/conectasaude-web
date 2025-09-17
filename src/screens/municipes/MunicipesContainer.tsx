import React, { useState } from "react";
import { ListaMunicipesScreen } from "./ListaMunicipesScreen";
import { CadastroMunicipeScreen } from "./CadastroMunicipeScreen";
import { Municipe } from "../../types";
import { navigate } from "../../navigation/navigationService";

type MunicipesView = "lista" | "cadastro" | "edicao";

export const MunicipesContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<MunicipesView>("lista");
  const [selectedMunicipe, setSelectedMunicipe] = useState<Municipe | null>(
    null
  );

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

  if (currentView === "cadastro") {
    return <CadastroMunicipeScreen onBack={handleBackToList} />;
  }

  if (currentView === "edicao" && selectedMunicipe) {
    return (
      <CadastroMunicipeScreen
        onBack={handleBackToList}
        municipeToEdit={selectedMunicipe}
      />
    );
  }

  return (
    <ListaMunicipesScreen
      onNavigateToCadastro={handleNavigateToCadastro}
      onNavigateToEdit={handleNavigateToEdit}
    />
  );
};
