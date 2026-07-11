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
    images: [],
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
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('itemName', formData.itemName);
      formDataToSend.append('category', formData.category || 'Accessories');
      formDataToSend.append('brand', formData.brand || 'N/A');
      formDataToSend.append('color', formData.color || 'N/A');
      formDataToSend.append('description', formData.description || 'N/A');
      formDataToSend.append('locationFound', formData.location || 'Student Union');
      formDataToSend.append('lastSeen', formData.location || 'Student Union');
      
      const foundDateObj = formData.foundDate && formData.foundTime
        ? new Date(`${formData.foundDate}T${formData.foundTime}`)
        : formData.foundDate
        ? new Date(formData.foundDate)
        : new Date();
      formDataToSend.append('dateFound', foundDateObj.toISOString());

      if (lostItemId) {
        formDataToSend.append('linkedLostItem', lostItemId);
      }

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      await axios.post(`${API_BASE}/api/found-items`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : ''
        }
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
