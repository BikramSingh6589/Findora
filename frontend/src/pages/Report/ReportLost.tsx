import React, { useState } from 'react';

import { LostStepBasicInfo } from './components/LostStepBasicInfo';
import { LostStepDetails } from './components/LostStepDetails';
import { LostStepReview } from './components/LostStepReview';
import { ReportLostSuccess } from './components/ReportLostSuccess';
import type { LostFormData } from './types';

export const ReportLost: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LostFormData>({
    itemName: '',
    category: '',
    lastSeenLocation: '',
    lostDateTime: '',
    description: '',
    color: '',
    brand: '',
  });

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const updateData = (newData: Partial<LostFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    setCurrentStep(4);
  };

  return (
    <div className="flex flex-col items-center w-full pb-32 lg:pb-8">
      <div className="w-full max-w-4xl">
        {currentStep === 1 && (
          <LostStepBasicInfo data={formData} updateData={updateData} onNext={nextStep} />
        )}
        {currentStep === 2 && (
          <LostStepDetails data={formData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />
        )}
        {currentStep === 3 && (
          <LostStepReview data={formData} onSubmit={handleSubmit} onEdit={() => setCurrentStep(1)} />
        )}
        {currentStep === 4 && (
          <ReportLostSuccess />
        )}
      </div>
    </div>
  );
};
