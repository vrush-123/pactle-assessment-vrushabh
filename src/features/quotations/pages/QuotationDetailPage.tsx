import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getQuotationById } from '../api/quotationsApi';
import { usePermissions } from '../../../hooks/usePermissions';
import { useSaveQuotation } from '../hooks/useSaveQuotation';
import { useUpdateStatus } from '../hooks/useUpdateStatus';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Pill } from '../../../components/ui/Pill';
import { Button } from '../../../components/ui/Button';
import { CommentThread } from '../components/CommentThread';
import { QuotationHistory } from '../components/QuotationHistory';

export const QuotationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const { canEdit, canApproveReject } = usePermissions();
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateStatus();
  
  const [isEditing, setIsEditing] = useState(false);
  
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const {
    data: quotation,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => getQuotationById(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, reset } = useForm();
  const saveMutation = useSaveQuotation();

  useEffect(() => {
    if (quotation) {
      reset(quotation);
    }
  }, [quotation, reset]);

  const onSubmit = (data: any) => {
    saveMutation.mutate(
      { id: id!, payload: { client: data.client, amount: Number(data.amount) } },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const isActionable = quotation?.status === 'Pending';

  const handleApprove = () => {
    if (!canApproveReject || !isActionable) return;
    updateStatus({ id: quotation!.id, status: 'Approved' });
  };

  const handleReject = () => {
    if (!canApproveReject || !isActionable) return;
    updateStatus({
      id: quotation!.id,
      status: 'Rejected',
      reason: rejectionReason || undefined,
    }, {
      onSuccess: () => {
        setShowRejectInput(false);
        setRejectionReason('');
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (canApproveReject && isActionable) {
        if (event.key === 'a') {
          event.preventDefault(); 
          handleApprove();
        } else if (event.key === 'r') {
          event.preventDefault(); 
          if (!showRejectInput) {
            setShowRejectInput(true);
          } else {
            handleReject();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canApproveReject, isActionable, showRejectInput, rejectionReason, handleApprove, handleReject]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={(error as Error).message} />;
  if (!quotation) return <div>Quotation not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/quotations" className="text-blue-600 hover:underline">
        &larr; Back to all quotations
      </Link>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <Pill status={quotation.status} />
          
          {/* Approve/Reject buttons */}
          {canApproveReject && isActionable && !showRejectInput && (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleApprove}
                isLoading={isStatusUpdating}
                className="bg-green-100 text-green-700 hover:bg-green-200"
              >
                Approve (a)
              </Button>
              <Button 
                type="button"
                variant="danger" 
                onClick={() => setShowRejectInput(true)}
              >
                Reject (r)
              </Button>
            </div>
          )}
          
          {/* Edit/Save/Cancel buttons */}
          {canEdit && !showRejectInput && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      reset(quotation);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={saveMutation.isPending}>
                    Save
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Conditional Rejection Reason input */}
        {canApproveReject && showRejectInput && (
          <div className="w-full p-4 bg-gray-50 rounded-lg mt-4 border border-border-main">
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-text-dark">
              Rejection Reason (Optional)
            </label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border border-border-main rounded-md mt-1"
              rows={3}
              placeholder="e.g., Order below minimum quantity."
            />
            <div className="flex gap-2 mt-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowRejectInput(false)}>
                Cancel
              </Button>
              <Button 
                type="button"
                variant="danger" 
                onClick={handleReject} 
                isLoading={isStatusUpdating}
              >
                Confirm Reject (r)
              </Button>
            </div>
          </div>
        )}

        {/* Core Fields */}
        <div className="mt-4 p-6 bg-white shadow rounded-lg space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Client</label>
            {isEditing && canEdit ? (
              <input
                {...register('client')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-2xl font-semibold text-gray-900">{quotation.client}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Amount</label>
            {isEditing && canEdit ? (
              <input
                {...register('amount')}
                type="number"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-xl text-gray-700">
                ${quotation.amount.toLocaleString()}
              </p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-700">{quotation.description || 'N/A'}</p>
          </div>
        </div>
      </form>
      
      <QuotationHistory history={quotation.history} />
      <CommentThread quotation={quotation} />
    </div>
  );
};