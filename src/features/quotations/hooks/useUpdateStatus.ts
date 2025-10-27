import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchQuotation } from '../api/quotationsApi';
import type { Quotation, Status } from '../../../types';
import { useAuthStore } from '../../../store/authStore';

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: Status; reason?: string }) => {
      if (!user) throw new Error('User not authenticated');
      return patchQuotation(id, { status }, user, reason); 
    },

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['quotations'] });
      await queryClient.cancelQueries({ queryKey: ['quotation', id] });

      const previousList = queryClient.getQueryData<Quotation[]>(['quotations']);
      const previousDetail = queryClient.getQueryData<Quotation>(['quotation', id]);

      if (previousList) {
        queryClient.setQueryData<Quotation[]>(
          ['quotations'],
          (old) =>
            old?.map((q) =>
              q.id === id ? { ...q, status, last_updated: new Date().toISOString() } : q
            ) ?? []
        );
      }
      if (previousDetail) {
        queryClient.setQueryData<Quotation>(['quotation', id], (old) =>
          old ? { ...old, status, last_updated: new Date().toISOString() } : undefined
        );
      }

      return { previousList, previousDetail };
    },
    
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['quotations'], context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(['quotation', variables.id], context.previousDetail);
      }
      console.error('Update failed, rolling back.');
    },
    
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
    },
  });
};