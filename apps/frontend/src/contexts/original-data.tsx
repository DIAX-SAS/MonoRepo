"use client"
import { PIMMState } from '@repo-hub/internal';
import React, { createContext, ReactNode, useContext, useState } from 'react';

// Contexto para los datos originales
interface OriginalDataContextType {
  originalData: PIMMState[];
  setOriginalData: React.Dispatch<React.SetStateAction<PIMMState[]>>;
}

const OriginalDataContext = createContext<OriginalDataContextType | undefined>(
  undefined
);

export const OriginalDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [originalData, setOriginalData] = useState<PIMMState[]>([]);

  return (
    <OriginalDataContext.Provider value={{ originalData, setOriginalData }}>
      {children}
    </OriginalDataContext.Provider>
  );
};

export const useOriginalData = () => {
  const context = useContext(OriginalDataContext);
  if (!context) {
    throw new Error(
      'useOriginalData debe usarse dentro de un OriginalDataProvider'
    );
  }
  return context;
};
