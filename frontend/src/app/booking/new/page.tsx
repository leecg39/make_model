// @TASK P3-S1-T1 - Booking Wizard Page
// @SPEC specs/screens/booking-wizard.yaml

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { bookingService } from '@/services/booking';
import WizardStepper from '@/components/booking/WizardStepper';
import Step1ConceptForm from '@/components/booking/Step1ConceptForm';
import Step2Recommendation from '@/components/booking/Step2Recommendation';
import Step3PackagePayment from '@/components/booking/Step3PackagePayment';
import PaymentSuccessModal from '@/components/booking/PaymentSuccessModal';
import PaymentErrorModal from '@/components/booking/PaymentErrorModal';
import type { MatchingRecommendation } from '@/types/booking';

export default function BookingWizardPage() {
  const user = useAuthStore((state) => state.user);

  const [currentStep, setCurrentStep] = useState(1);
  const [conceptData, setConceptData] = useState<{ concept: string; images: string[] } | null>(null);
  const [recommendations, setRecommendations] = useState<MatchingRecommendation[]>([]);
  const [selectedModel, setSelectedModel] = useState<MatchingRecommendation['model'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; totalAmount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Auth checks
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다.</h1>
          <p className="text-gray-600">섭외 서비스를 이용하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'brand') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">브랜드 회원만 이용 가능합니다.</h1>
          <p className="text-gray-600">이 서비스는 브랜드 회원 전용입니다.</p>
        </div>
      </div>
    );
  }

  // Step 1: Submit concept
  const handleConceptSubmit = async (concept: string, images: string[]) => {
    setIsLoading(true);
    try {
      const response = await bookingService.getRecommendations(concept, images);
      setConceptData({ concept, images });
      setRecommendations(response.recommendations);
      setCurrentStep(2);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      const errorMsg = error instanceof Error ? error.message : 'AI 추천을 가져오는데 실패했습니다.';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Select model
  const handleModelSelect = (model: MatchingRecommendation['model']) => {
    setSelectedModel(model);
    setCurrentStep(3);
  };

  // Step 3: Process payment
  const handlePayment = async (
    packageType: string,
    totalPrice: number,
    imageCount: number,
    isExclusive: boolean,
    exclusiveMonths?: number
  ) => {
    if (!selectedModel || !conceptData || !user) return;

    setIsLoading(true);
    try {
      // Create order
      const order = await bookingService.createOrder({
        model_id: selectedModel.id,
        creator_id: selectedModel.creator_id,
        concept_description: conceptData.concept,
        package_type: packageType,
        image_count: imageCount,
        total_price: totalPrice,
        is_exclusive: isExclusive,
        exclusive_months: exclusiveMonths,
      });

      // Create payment
      await bookingService.createPayment({
        order_id: order.id,
        payment_method: 'card',
        amount: totalPrice,
      });

      // Show success modal
      setOrderResult({
        orderNumber: order.order_number,
        totalAmount: totalPrice,
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Payment failed:', error);
      const errorMsg = error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Stepper navigation
  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI 모델 섭외</h1>

        <WizardStepper currentStep={currentStep} onStepClick={handleStepClick} />

        <div className="mt-8">
          {currentStep === 1 && <Step1ConceptForm onSubmit={handleConceptSubmit} />}

          {currentStep === 2 && (
            <Step2Recommendation recommendations={recommendations} onSelect={handleModelSelect} />
          )}

          {currentStep === 3 && selectedModel && (
            <Step3PackagePayment
              selectedModel={selectedModel}
              onPayment={handlePayment}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {orderResult && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          orderNumber={orderResult.orderNumber}
          totalAmount={orderResult.totalAmount}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      <PaymentErrorModal
        isOpen={showErrorModal}
        errorMessage={errorMessage}
        onClose={() => setShowErrorModal(false)}
        onRetry={() => {
          // Retry payment logic can be added here
          setShowErrorModal(false);
        }}
      />
    </div>
  );
}
