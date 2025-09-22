'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Tool } from '@/types';

interface ModalContextType {
  selectedTool: Tool | null;
  isModalOpen: boolean;
  openModal: (tool: Tool) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (tool: Tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTool(null);
  };

  return (
    <ModalContext.Provider value={{ selectedTool, isModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
