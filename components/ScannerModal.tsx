
import React, { useEffect, useState } from 'react';
import { XIcon } from './Icons';

declare var Html5Qrcode: any;

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [manualBarcode, setManualBarcode] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const html5QrCode = new Html5Qrcode("reader");
    const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
      onScanSuccess(decodedText);
      html5QrCode.stop().catch((err: any) => console.error("Failed to stop scanner", err));
    };
    const config = { fps: 10, qrbox: { width: 300, height: 150 } };

    // Start scanning
    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, (errorMessage: string) => {
      // parse error, ignore
    }).catch((err: any) => {
        console.error("Failed to start scanner", err);
        // Fallback for devices without a back camera
        html5QrCode.start({ facingMode: "user" }, config, qrCodeSuccessCallback, (errorMessage: string) => {}).catch((err: any) => {
             console.error("Failed to start user-facing scanner", err);
        });
    });

    // Cleanup function
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err: any) => console.error("Cleanup stop scanner failed", err));
      }
    };
  }, [isOpen, onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScanSuccess(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 p-2 rounded-full text-white hover:bg-white/20 z-10" aria-label="Close scanner">
          <XIcon className="w-7 h-7" />
        </button>
        
        <div className="relative w-full aspect-video sm:aspect-square overflow-hidden rounded-xl border-2 border-white/20 bg-gray-900 flex items-center justify-center">
          <div id="reader" className="w-full h-full"></div>
          
          {/* Overlay and Bounding Box */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[90%] h-[50%] relative">
               {/* Darkened overlay achieved by a large box-shadow on a sibling */}
              <div className="absolute inset-0" style={{boxShadow: '0 0 0 2000px rgba(0,0,0,0.5)'}}></div>
              
              {/* Corner guides */}
              <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            </div>
          </div>
        </div>
        
        <p className="text-white text-center mt-4 font-semibold">Place a barcode inside the frame to scan it.</p>

        <div className="flex items-center w-full my-4">
            <div className="flex-grow border-t border-gray-500"></div>
            <span className="flex-shrink mx-4 text-gray-400 font-semibold">OR</span>
            <div className="flex-grow border-t border-gray-500"></div>
        </div>
        
        <p className="text-white text-center mb-2 font-semibold">Enter EAN or UPC number manually</p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="e.g. 123456789012"
                className="flex-grow bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purepick-green transition"
                aria-label="Enter barcode manually"
            />
            <button
                type="submit"
                className="bg-purepick-green text-white font-bold px-6 py-2 rounded-lg hover:bg-purepick-green-dark transition-colors disabled:opacity-50"
                disabled={!manualBarcode.trim()}
            >
                Search
            </button>
        </form>
      </div>
    </div>
  );
};

export default ScannerModal;
