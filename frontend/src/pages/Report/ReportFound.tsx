import React, { useState } from 'react';

import { StepBasicInfo } from './components/StepBasicInfo';
import { StepDetails } from './components/StepDetails';
import { StepReview } from './components/StepReview';
import { ReportFoundSuccess } from './components/ReportFoundSuccess';
import type { ReportFormData } from './types';

export type { ReportFormData };
export const ReportFound: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ReportFormData>({
    itemName: '',
    category: '',
    foundDate: '',
    foundTime: '',
    location: '',
    color: '',
    brand: '',
    description: '',
  });

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const updateData = (newData: Partial<ReportFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    setCurrentStep(4);
  };

  return (
    <div className="flex flex-col items-center w-full pb-32 lg:pb-8">
      <div className="w-full max-w-4xl">
        {currentStep === 1 && (
          <StepBasicInfo 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep} 
          />
        )}
        {currentStep === 2 && (
          <StepDetails 
            data={formData} 
            updateData={updateData} 
            onNext={nextStep} 
            onPrev={prevStep}
          />
        )}
        {currentStep === 3 && (
          <StepReview 
            data={formData} 
            onSubmit={handleSubmit} 
            onEdit={() => setCurrentStep(1)} 
          />
        )}
        {currentStep === 4 && (
          <ReportFoundSuccess />
        )}
      </div>
    </div>
  );
};
