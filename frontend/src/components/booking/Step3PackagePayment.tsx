// @TASK P3-S1-T1 - Step 3 Package & Payment
// @SPEC specs/screens/booking-wizard.yaml

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PackageOption } from '@/types/booking';

interface Step3PackagePaymentProps {
  selectedModel: {
    id: string;
    name: string;
    style: string;
    gender: string;
    age_range: string;
    thumbnail_url: string | null;
  };
  onPayment: (packageType: string, totalPrice: number, imageCount: number, isExclusive: boolean, exclusiveMonths?: number) => void;
  isLoading?: boolean;
}

const PACKAGES: PackageOption[] = [
  {
    type: 'standard',
    name: 'Standard',
    imageCount: 3,
    price: 50000,
    isExclusive: false,
    description: '기본 3장',
  },
  {
    type: 'premium',
    name: 'Premium',
    imageCount: 5,
    price: 100000,
    isExclusive: false,
    description: '프리미엄 5장',
  },
  {
    type: 'exclusive',
    name: 'Exclusive',
    imageCount: 10,
    price: 200000,
    isExclusive: true,
    exclusiveMonths: 3,
    description: '독점 10장 (3개월)',
  },
];

export default function Step3PackagePayment({ selectedModel, onPayment, isLoading }: Step3PackagePaymentProps) {
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPackage) {
      onPayment(
        selectedPackage.type,
        selectedPackage.price,
        selectedPackage.imageCount,
        selectedPackage.isExclusive,
        selectedPackage.exclusiveMonths
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6">패키지 선택</h2>

      {/* Selected Model Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center gap-4">
        {selectedModel.thumbnail_url && (
          <img
            src={selectedModel.thumbnail_url}
            alt={selectedModel.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
        <div>
          <h3 className="font-semibold text-lg">{selectedModel.name}</h3>
          <p className="text-sm text-gray-600">
            {selectedModel.style} · {selectedModel.gender} · {selectedModel.age_range}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {PACKAGES.map((pkg, index) => (
            <motion.label
              key={pkg.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`cursor-pointer border-2 rounded-lg p-6 transition-all ${
                selectedPackage?.type === pkg.type
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="package"
                value={pkg.type}
                checked={selectedPackage?.type === pkg.type}
                onChange={() => setSelectedPackage(pkg)}
                className="sr-only"
                aria-label={`${pkg.name} 패키지 선택`}
              />

              <div className="space-y-3">
                <h3 className="font-bold text-xl">{pkg.name}</h3>
                <p className="text-3xl font-bold text-blue-600">₩{pkg.price.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{pkg.description}</p>

                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• {pkg.imageCount}장 이미지</li>
                  {pkg.isExclusive && <li>• {pkg.exclusiveMonths}개월 독점</li>}
                </ul>
              </div>
            </motion.label>
          ))}
        </div>

        {selectedPackage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold">총 금액:</span>
              <span className="text-2xl font-bold text-blue-600">
                ₩{selectedPackage.price.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={!selectedPackage || isLoading}
          whileHover={{ scale: selectedPackage && !isLoading ? 1.02 : 1 }}
          whileTap={{ scale: selectedPackage && !isLoading ? 0.98 : 1 }}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            selectedPackage && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          aria-busy={isLoading}
        >
          {isLoading ? '처리 중...' : '결제하기'}
        </motion.button>
      </form>
    </motion.div>
  );
}
