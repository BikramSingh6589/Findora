import React, { useState } from 'react';
import axios from 'axios';

import { LostStepBasicInfo } from './components/LostStepBasicInfo';
import { LostStepDetails } from './components/LostStepDetails';
import { LostStepReview } from './components/LostStepReview';
import { ReportLostSuccess } from './components/ReportLostSuccess';
import type { LostFormData } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
    images: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const updateData = (newData: Partial<LostFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('itemName', formData.itemName);
      formDataToSend.append('category', formData.category || 'Accessories');
      formDataToSend.append('brand', formData.brand || 'N/A');
      formDataToSend.append('color', formData.color || 'N/A');
      formDataToSend.append('description', formData.description || 'N/A');
      formDataToSend.append('locationLost', formData.lastSeenLocation || 'Student Union');
      formDataToSend.append('dateLost', formData.lostDateTime ? new Date(formData.lostDateTime).toISOString() : new Date().toISOString());

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      await axios.post(`${API_BASE}/api/lost-items`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      setCurrentStep(4);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full pb-32 lg:pb-8">
      <div className="w-full max-w-4xl">
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {currentStep === 1 && (
          <LostStepBasicInfo data={formData} updateData={updateData} onNext={nextStep} />
        )}
        {currentStep === 2 && (
          <LostStepDetails data={formData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />
        )}
        {currentStep === 3 && (
          <LostStepReview data={formData} onSubmit={handleSubmit} onEdit={() => setCurrentStep(1)} isSubmitting={isSubmitting} />
        )}
        {currentStep === 4 && (
          <ReportLostSuccess />
        )}
      </div>
    </div>
  );
};
