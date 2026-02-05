// @TASK P4-S2-T1 - Upload Delivery Files Modal Component
// @SPEC specs/screens/creator-dashboard.yaml

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadModalProps {
  isOpen: boolean;
  orderId: string;
  onConfirm: (orderId: string, files: File[], notes?: string) => Promise<void>;
  onCancel: () => void;
}

export function UploadModal({
  isOpen,
  orderId,
  onConfirm,
  onCancel,
}: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setError('');
    }
  };

  const handleConfirm = async () => {
    if (files.length === 0) {
      setError('최소 1개의 파일을 선택해주세요');
      return;
    }

    setIsUploading(true);
    try {
      await onConfirm(orderId, files, notes || undefined);
      setFiles([]);
      setNotes('');
      setError('');
    } catch (err) {
      setError('업로드 실패');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFiles([]);
    setNotes('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={handleCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
          onClick={(e) => e.stopPropagation()}
          className="bg-bg-secondary border border-white/10 rounded-2xl p-6 w-full max-w-md"
        >
          <h2 id="upload-modal-title" className="text-xl font-bold text-white mb-4">
            작업물 업로드
          </h2>

          <div className="space-y-4">
            {/* File Input */}
            <div>
              <label htmlFor="file-upload" className="block text-sm text-white/80 mb-2">
                파일 선택
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                accept="image/*,.pdf,.zip"
                onChange={handleFileChange}
                aria-label="파일 선택"
                className="
                  w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                  text-white file:mr-4 file:px-4 file:py-2 file:rounded-lg
                  file:border-0 file:bg-accent-neon file:text-black file:font-medium
                  hover:file:bg-accent-neon/90 cursor-pointer
                "
              />
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <p key={index} className="text-sm text-white/60">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  ))}
                </div>
              )}
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="upload-notes" className="block text-sm text-white/80 mb-2">
                전달 사항 (선택)
              </label>
              <textarea
                id="upload-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="전달 사항 (선택)"
                rows={3}
                className="
                  w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                  text-white placeholder-white/40
                  focus:border-accent-neon focus:outline-none
                "
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={isUploading}
                className="px-6 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50"
              >
                취소
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={isUploading}
                className="px-6 py-2 bg-accent-neon text-black rounded-lg font-semibold disabled:opacity-50"
              >
                {isUploading ? '업로드 중...' : '업로드'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
