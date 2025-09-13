import React, { useState } from 'react';
import { ListaMunicipesScreen } from './ListaMunicipesScreen';
import { CadastroMunicipeScreen } from './CadastroMunicipeScreen';

type MunicipesView = 'lista' | 'cadastro';

export const MunicipesContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<MunicipesView>('lista');

  const handleNavigateToCadastro = () => {
    setCurrentView('cadastro');
  };

  const handleBackToList = () => {
    setCurrentView('lista');
  };

  if (currentView === 'cadastro') {
    return <CadastroMunicipeScreen onBack={handleBackToList} />;
  }

  return (
    <ListaMunicipesScreen 
      onNavigateToCadastro={handleNavigateToCadastro}
    />
  );
};
