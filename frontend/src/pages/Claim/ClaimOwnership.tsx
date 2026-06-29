import React, { useState } from 'react';

import { ClaimVerification } from './components/ClaimVerification';
import { ClaimProof } from './components/ClaimProof';
import { ClaimReview } from './components/ClaimReview';
import { ClaimOwnershipSuccess } from './components/ClaimOwnershipSuccess';
import type { ClaimFormData } from './types';

export const ClaimOwnership: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClaimFormData>({
    location: '',
    lostDate: '',
    lostTime: '',
    identifiers: '',
    additionalInfo: '',
  });

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const updateData = (newData: Partial<ClaimFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    setCurrentStep(4);
  };

  return (
    <div className="flex flex-col items-center w-full pb-32 lg:pb-8">
      <div className="w-full max-w-4xl mt-4 md:mt-8">
        
        {/* Progress Header - Only show if not on success step */}
        {currentStep < 4 && (
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-primary mb-2">Claim Ownership</h1>
            <p className="text-text-secondary">Provide details to verify this item belongs to you.</p>
          </div>
        )}

        <div className="bg-white rounded-[24px] shadow-sm border border-border-default overflow-hidden">
          {currentStep === 1 && (
            <ClaimVerification data={formData} updateData={updateData} onNext={nextStep} />
          )}
          {currentStep === 2 && (
            <ClaimProof data={formData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 3 && (
            <ClaimReview data={formData} onSubmit={handleSubmit} onEdit={() => setCurrentStep(1)} />
          )}
        </div>
        
        {/* Success Step rendered outside the white box for full-page effect */}
        {currentStep === 4 && (
          <ClaimOwnershipSuccess />
        )}
      </div>
    </div>
  );
};
