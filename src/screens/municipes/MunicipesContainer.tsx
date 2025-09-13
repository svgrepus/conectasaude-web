import React, { useState } from 'react';
import { ListaMunicipesScreen } from './ListaMunicipesScreen';
import { CadastroMunicipeScreen } from './CadastroMunicipeScreen';
import { Municipe } from '../../types';

type MunicipesView = 'lista' | 'cadastro' | 'edicao';

export const MunicipesContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<MunicipesView>('lista');
  const [selectedMunicipe, setSelectedMunicipe] = useState<Municipe | null>(null);

  const handleNavigateToCadastro = () => {
    setSelectedMunicipe(null);
    setCurrentView('cadastro');
  };

  const handleNavigateToEdit = (municipe: Municipe) => {
    setSelectedMunicipe(municipe);
    setCurrentView('edicao');
  };

  const handleBackToList = () => {
    setSelectedMunicipe(null);
    setCurrentView('lista');
  };

  if (currentView === 'cadastro') {
    return <CadastroMunicipeScreen onBack={handleBackToList} />;
  }

  if (currentView === 'edicao' && selectedMunicipe) {
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
