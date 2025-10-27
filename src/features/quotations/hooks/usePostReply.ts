import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postReply } from '../api/quotationsApi';
import type { Role } from '../../../types';

export const usePostReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      quotationId: string;
      commentId: number;
      text: string;
      author: string;
      role: Role;
    }) => postReply(vars),
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
    },
  });
};