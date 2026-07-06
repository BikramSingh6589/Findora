import React, { useState } from 'react';
import axios from 'axios';

import { StepBasicInfo } from './components/StepBasicInfo';
import { StepDetails } from './components/StepDetails';
import { StepReview } from './components/StepReview';
import { ReportFoundSuccess } from './components/ReportFoundSuccess';
import type { ReportFormData } from './types';

import { useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export type { ReportFormData };
export const ReportFound: React.FC = () => {
  const [searchParams] = useSearchParams();
  const lostItemId = searchParams.get('lostItemId');

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
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const updateData = (newData: Partial<ReportFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      await axios.post(`${API_BASE}/api/found-items`, {
        itemName: formData.itemName,
        category: formData.category || 'Accessories',
        brand: formData.brand || 'N/A',
        color: formData.color || 'N/A',
        description: formData.description || 'N/A',
        locationFound: formData.location || 'Student Union',
        lastSeen: formData.location || 'Student Union',
        dateFound: formData.foundDate ? new Date(formData.foundDate) : new Date(),
        linkedLostItem: lostItemId || undefined
      });
      setCurrentStep(4);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center w-full pb-32 lg:pb-8">
      <div className="w-full max-w-4xl">
        {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}
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
