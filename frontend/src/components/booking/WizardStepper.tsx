// @TASK P3-S1-T1 - Wizard Stepper Component
// @SPEC specs/screens/booking-wizard.yaml

'use client';

import { motion } from 'framer-motion';

interface WizardStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const steps = [
  { number: 1, label: '콘셉트' },
  { number: 2, label: 'AI 추천' },
  { number: 3, label: '패키지/결제' },
];

export default function WizardStepper({ currentStep, onStepClick }: WizardStepperProps) {
  return (
    <nav aria-label="진행 단계">
      <ol className="flex items-center justify-center gap-4 md:gap-8 mb-8">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = currentStep >= step.number;

          return (
            <li key={step.number} className="flex items-center gap-2">
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={`flex items-center gap-2 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    ${isCurrent ? 'bg-blue-600 text-white' : ''}
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${!isCurrent && !isCompleted ? 'bg-gray-200 text-gray-600' : ''}
                  `}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {isCompleted ? '✓' : step.number}
                </motion.div>
                <span className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                  {step.number}. {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className="hidden md:block w-12 h-0.5 bg-gray-300 mx-2" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
