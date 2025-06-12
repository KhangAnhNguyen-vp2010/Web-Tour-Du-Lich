import React from "react";
import "./QRModal.scss";

const QRModal = ({ show, onClose, qrImage }) => {
  if (!show) return null;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h5 className="modal-title">Mã QR Vé</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>
        <div className="qr-modal-body">
          <img src={qrImage} alt="QR Code" className="qr-image" />
        </div>
      </div>
    </div>
  );
};

export default QRModal;
