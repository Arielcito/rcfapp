import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center  overflow-y-auto">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="text-xl font-bold">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
