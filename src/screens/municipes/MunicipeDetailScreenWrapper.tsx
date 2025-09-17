import React from 'react';
import { MunicipeDetailScreen } from './MunicipeDetailScreen';

// This wrapper makes the MunicipeDetailScreen compatible with React Navigation
export const MunicipeDetailScreenWrapper: React.FC<any> = (props) => {
  return <MunicipeDetailScreen {...props} />;
};