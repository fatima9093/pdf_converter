'use client';

import { useModal } from '@/contexts/ModalContext';
import FileUploadModal from './FileUploadModal';
import SplitPDFModal from './SplitPDFModal';
import CompressPDFModal from './CompressPDFModal';

export default function ModalManager() {
  const { selectedTool, isModalOpen, closeModal } = useModal();

  if (!isModalOpen || !selectedTool) return null;

  // Render the appropriate modal based on the selected tool
  switch (selectedTool.id) {
    case 'split-pdf':
      return (
        <SplitPDFModal
          tool={selectedTool}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      );
    case 'compress-pdf':
      return (
        <CompressPDFModal
          tool={selectedTool}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      );
    default:
      return (
        <FileUploadModal
          tool={selectedTool}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      );
  }
}
