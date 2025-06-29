import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import './Modal.css'; // Usaremos um CSS simples para o modal

const SignatureModal = ({ isOpen, onClose, onSave, fieldToSign }) => {
  const sigCanvas = useRef({});

  if (!isOpen) {
    return null;
  }

  const clear = () => {
    sigCanvas.current.clear();
  };

  const save = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Por favor, forneça uma assinatura.");
      return;
    }
    const signatureData = sigCanvas.current.toDataURL('image/png');
    onSave(fieldToSign, signatureData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>Assinatura de: {fieldToSign.name}</h4>
        <div className="signature-canvas-container">
          <SignatureCanvas
            ref={sigCanvas}
            penColor='black'
            canvasProps={{ className: 'signature-canvas' }}
          />
        </div>
        <div className="modal-actions">
          <button onClick={clear}>Limpar</button>
          <button onClick={save}>Salvar e Fechar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal; 