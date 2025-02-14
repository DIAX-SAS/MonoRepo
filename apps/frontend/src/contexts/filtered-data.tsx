"use client"
import { PIMMState } from '@repo-hub/internal';
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Contexto para los datos filtrados
interface FilteredDataContextType {
    filteredData: PIMMState[];
    setFilteredData: React.Dispatch<React.SetStateAction<PIMMState[]>>;
  }
  
  const FilteredDataContext = createContext<FilteredDataContextType | undefined>(undefined);
  
  export const FilteredDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [filteredData, setFilteredData] = useState<PIMMState[]>([]);
  
    return (
      <FilteredDataContext.Provider value={{ filteredData, setFilteredData }}>
        {children}
      </FilteredDataContext.Provider>
    );
  };
  
  export const useFilteredData = () => {
    const context = useContext(FilteredDataContext);
    if (!context) {
      throw new Error('useFilteredData debe usarse dentro de un FilteredDataProvider');
    }
    return context;
  };