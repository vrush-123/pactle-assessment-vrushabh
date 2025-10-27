import { apiClient } from '../../../lib/apiClient';
import type { Quotation, Comment, Reply, Role, User, HistoryEntry } from '../../../types';

const QUOTES_PER_PAGE = 10;

type QuotationsParams = {
  q?: string;
  status?: string;
  pageParam: number;
};

export const getQuotations = async (
  params: QuotationsParams
): Promise<{ data: Quotation[]; nextPage: number | undefined }> => {
  
  const { q, status, pageParam } = params;

  const config = {
    params: {
      q: q || undefined,
      status: status && status !== 'all' ? status : undefined,
      _page: pageParam,
      _limit: QUOTES_PER_PAGE,
    },
  };
  
  const response = await apiClient.get('/quotations', config);

  const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
  
  const hasMore = (pageParam * QUOTES_PER_PAGE) < totalCount;

  return {
    data: response.data, 
    nextPage: hasMore ? pageParam + 1 : undefined, 
  };
};

export const getQuotationById = async (id: string): Promise<Quotation> => {
  const { data } = await apiClient.get(`/quotations/${id}`);
  return data;
};

const createHistoryEntry = (
  user: User,
  payload: Partial<Quotation>,
  currentQuote: Quotation,
  notes?: string
): HistoryEntry | null => {
  const newEntry: Omit<HistoryEntry, 'id' | 'timestamp' | 'notes'> & { notes?: string } = {
    user: user.name,
    action: '',
  };

  const changes: string[] = [];

  if (payload.status && payload.status !== currentQuote.status) {
    changes.push(`Changed status from ${currentQuote.status} to ${payload.status}`);
  }
  if (payload.client && payload.client !== currentQuote.client) {
    changes.push(`Changed client from "${currentQuote.client}" to "${payload.client}"`);
  }
  if (payload.amount && payload.amount !== currentQuote.amount) {
    changes.push(`Changed amount from $${currentQuote.amount.toLocaleString()} to $${Number(payload.amount).toLocaleString()}`);
  }

  if (changes.length === 0) {
    return null;
  }

  newEntry.action = changes.join('; ');

  if (changes.length > 0 && notes) {
    newEntry.notes = notes;
  }

  return {
    ...newEntry,
    id: Math.floor(Math.random() * 10000),
    timestamp: new Date().toISOString(),
  };
};

export const patchQuotation = async (
  id: string,
  payload: Partial<Quotation>,
  user?: User,
  notes?: string
): Promise<Quotation> => {
  
  let finalPayload = { ...payload };

  if (user) {
    const currentQuote = await getQuotationById(id);
    const historyEntry = createHistoryEntry(user, payload, currentQuote, notes);

    if (historyEntry) {
      finalPayload = {
        ...payload,
        last_updated: historyEntry.timestamp,
        history: [...currentQuote.history, historyEntry],
      };
    }
  }

  const { data } = await apiClient.patch(`/quotations/${id}`, finalPayload);
  return data;
};

export const postComment = async ({
  quotationId,
  text,
  author,
  role,
}: {
  quotationId: string;
  text: string;
  author: string;
  role: Role;
}): Promise<Quotation> => {
  const quotation = await getQuotationById(quotationId);

  const newComment: Comment = {
    id: Math.floor(Math.random() * 10000),
    author,
    role,
    text,
    timestamp: new Date().toISOString(),
    replies: [],
  };

  const updatedComments = [...quotation.comments, newComment];
  return patchQuotation(quotationId, { comments: updatedComments });
};

export const postReply = async ({
  quotationId,
  commentId,
  text,
  author,
  role,
}: {
  quotationId: string;
  commentId: number;
  text: string;
  author: string;
  role: Role;
}): Promise<Quotation> => {
  const quotation = await getQuotationById(quotationId);

  const newReply: Reply = {
    id: Math.floor(Math.random() * 10000),
    author,
    role,
    text,
    timestamp: new Date().toISOString(),
  };

  const updatedComments = quotation.comments.map(comment => {
    if (comment.id === commentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      };
    }
    return comment;
  });

  return patchQuotation(quotationId, { comments: updatedComments });
};