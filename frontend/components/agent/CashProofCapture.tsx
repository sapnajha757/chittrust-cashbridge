'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, CheckCircle2, RotateCcw, AlertCircle, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface CashProofCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClear: () => void;
  previewUrl: string | null;
}

export function CashProofCapture({ onCapture, onClear, previewUrl }: CashProofCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate MIME types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10 MB. Please compress or take a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCapture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-bold text-slate-900">
        Take Photo Proof *
      </label>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1 text-xs text-blue-900">
        <p className="font-bold flex items-center gap-1 text-blue-800">
          <Camera className="w-4 h-4 text-blue-600" /> Photo Capture Instructions:
        </p>
        <ul className="text-[11px] text-blue-800 space-y-0.5 pl-4 list-disc font-medium">
          <li>Ensure Member and Cash Amount are clearly visible.</li>
          <li>Hold currency notes flat under good lighting.</li>
        </ul>
      </div>

      {/* Hidden file input with camera environment capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md max-h-64 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Cash Proof Preview" className="w-full h-full object-cover max-h-64" />
            <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
              <CheckCircle2 className="w-3 h-3" /> Proof Captured
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClear();
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="w-full text-xs font-bold flex items-center justify-center gap-1.5 py-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl cursor-pointer transition-all text-center space-y-2"
          >
            <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Take Photo Proof</p>
              <p className="text-xs text-slate-500 mt-0.5">Tap to launch mobile camera</p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800 font-medium">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <p className="text-[10px] text-slate-400 flex items-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        Payment proof is stored securely in private storage for verification and dispute resolution.
      </p>
    </div>
  );
}
