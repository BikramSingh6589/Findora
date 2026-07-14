import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import { ClaimVerification } from './components/ClaimVerification';
import { ClaimProof } from './components/ClaimProof';
import { ClaimReview } from './components/ClaimReview';
import { ClaimOwnershipSuccess } from './components/ClaimOwnershipSuccess';
import type { ClaimFormData } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ClaimOwnership: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const location = useLocation();

  // Load draft from local storage if available
  const draftKey = `claimDraft_${itemId}`;
  const getInitialState = () => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const stateLostItemId = location.state?.lostItemId;
    return {
      currentStep: 1,
      formData: {
        location: '',
        lostDate: '',
        lostTime: '',
        identifiers: '',
        additionalInfo: '',
        lostItemId: stateLostItemId || '',
      }
    };
  };

  const initialState = getInitialState();
  const [currentStep, setCurrentStep] = useState(initialState.currentStep);
  const [formData, setFormData] = useState<ClaimFormData>(initialState.formData);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [item, setItem] = useState<any | null>(null);
  const [loadingItem, setLoadingItem] = useState<boolean>(true);
  const [match, setMatch] = useState<any | null>(null);
  const [loadingMatch, setLoadingMatch] = useState<boolean>(true);

  // Auto-save draft on change
  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify({ currentStep, formData }));
  }, [currentStep, formData, draftKey]);

  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) {
        setLoadingItem(false);
        setLoadingMatch(false);
        return;
      }
      try {
        setLoadingItem(true);
        // Try found-items first, fallback to lost-items
        let fetchedItem = null;
        try {
          const res = await axios.get(`${API_BASE}/api/found-items/${itemId}`);
          if (res.data?.success) {
            fetchedItem = { ...res.data.item, itemType: 'found' };
          }
        } catch (err: any) {
          if (err.response?.status === 404) {
            try {
              const res2 = await axios.get(`${API_BASE}/api/lost-items/${itemId}`);
              if (res2.data?.success) {
                fetchedItem = { ...res2.data.item, itemType: 'lost' };
              }
            } catch (err2) {
              console.error(err2);
            }
          } else {
            console.error(err);
          }
        }
        setItem(fetchedItem);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingItem(false);
      }

      try {
        setLoadingMatch(true);
        const res = await axios.get(`${API_BASE}/api/ai/matches/${itemId}`);
        if (res.data?.success && res.data.matches && res.data.matches.length > 0) {
          // Find/sort matches by confidence descending
          const sorted = [...res.data.matches].sort((a: any, b: any) => b.score - a.score);
          setMatch(sorted[0]);
        } else {
          setMatch(null);
        }
      } catch (err) {
        console.error('Error fetching AI match for claim ownership', err);
        setMatch(null);
      } finally {
        setLoadingMatch(false);
      }
    };
    fetchData();
  }, [itemId]);

  const nextStep = () => setCurrentStep((prev: number) => prev + 1);
  const prevStep = () => setCurrentStep((prev: number) => Math.max(prev - 1, 1));
  const updateData = (newData: Partial<ClaimFormData>) => {
    setFormData((prev: ClaimFormData) => ({ ...prev, ...newData }));
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

      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('foundItemId', finalItemId || '');
      if (formData.lostItemId) {
        formDataToSend.append('lostItemId', formData.lostItemId);
      }
      formDataToSend.append('answers', JSON.stringify({
        location: formData.location,
        dateDetails: `${formData.lostDate} ${formData.lostTime}`,
        colorMatch: '',
        specialMarks: formData.identifiers,
      }));

      // Append files
      if (proofFiles && proofFiles.length > 0) {
        proofFiles.forEach((file) => {
          formDataToSend.append('proof', file);
        });
      }

      const res = await axios.post(`${API_BASE}/api/claims`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      localStorage.removeItem(draftKey);
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
            <ClaimVerification 
              data={formData} 
              updateData={updateData} 
              onNext={nextStep} 
              foundItemId={itemId}
              item={item}
              loadingItem={loadingItem}
              match={match}
              loadingMatch={loadingMatch}
            />
          )}
          {currentStep === 2 && (
            <ClaimProof 
              data={formData} 
              updateData={updateData} 
              onNext={nextStep} 
              onPrev={prevStep}
              item={item}
              match={match}
              proofFiles={proofFiles}
              setProofFiles={setProofFiles}
            />
          )}
          {currentStep === 3 && (
            <ClaimReview 
              data={formData} 
              updateData={updateData} 
              onSubmit={handleSubmit} 
              onEdit={() => setCurrentStep(1)} 
              proofFiles={proofFiles}
            />
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
