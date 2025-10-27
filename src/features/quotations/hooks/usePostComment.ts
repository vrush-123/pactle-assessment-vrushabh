import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postComment } from '../api/quotationsApi';
import type { Role } from '../../../types';

export const usePostComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      quotationId: string;
      text: string;
      author: string;
      role: Role;
    }) => postComment(vars),
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', data.id] });
    },
  });
};