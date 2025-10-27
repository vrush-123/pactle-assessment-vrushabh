import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchQuotation } from '../api/quotationsApi';
import type { Quotation } from '../../../types';
import { useAuthStore } from '../../../store/authStore'; 

export const useSaveQuotation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Quotation> }) => {
      if (!user) throw new Error('User not authenticated'); 
      return patchQuotation(id, payload, user);
    },


    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};