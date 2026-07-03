import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { ClaimVerification } from './components/ClaimVerification';
import { ClaimProof } from './components/ClaimProof';
import { ClaimReview } from './components/ClaimReview';
import { ClaimOwnershipSuccess } from './components/ClaimOwnershipSuccess';
import type { ClaimFormData } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ClaimOwnership: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClaimFormData>({
    location: '',
    lostDate: '',
    lostTime: '',
    identifiers: '',
    additionalInfo: '',
  });
  const [error, setError] = useState<string | null>(null);

  const { itemId } = useParams();

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const updateData = (newData: Partial<ClaimFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(itemId || '');
      let finalItemId = itemId;
      if (!isValidObjectId) {
        const itemsRes = await axios.get(`${API_BASE}/api/admin/items`);
        const foundItem = itemsRes.data?.items?.find((i: any) => i.type === 'found');
        if (foundItem) {
          finalItemId = foundItem.id;
        } else {
          throw new Error('No found items available to claim. Please report a found item first.');
        }
      }

      const res = await axios.post(`${API_BASE}/api/claims`, {
        foundItemId: finalItemId,
        answers: {
          location: formData.location || 'Main Library, 2nd Floor Study Lounge',
          dateDetails: formData.lostDate ? `${formData.lostDate} at ${formData.lostTime || 'N/A'}` : 'Tuesday, Oct 24th, between 2:00 PM and 4:30 PM',
          colorMatch: formData.identifiers || 'A small scratch on the bottom left corner and a \'Senior Student\' sticker on the front lid.',
          specialMarks: formData.additionalInfo || 'N/A'
        }
      });
      const claimId = res.data?.claim?._id || res.data?.claim?.id;
      if (claimId) {
        navigate(`/chat/finder/${claimId}`);
      } else {
        setCurrentStep(4);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to submit claim. Please try again.');
    }
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

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[24px] shadow-sm border border-border-default overflow-hidden">
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
