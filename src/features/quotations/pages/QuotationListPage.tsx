import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSearchParams, useNavigationType } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getQuotations } from '../api/quotationsApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { QuotationRow } from '../components/QuotationRow';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';

const SCROLL_POSITION_KEY = 'quotationListScrollPos';

export const QuotationListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType(); 
  
  const isInitialMount = useRef(true);

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [status, setStatus] = useState(() => searchParams.get('status') || 'all');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (navigationType === 'POP') {
      const savedPos = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedPos) {
        window.scrollTo(0, parseInt(savedPos, 10));
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
      }
    }
  }, [navigationType]); 

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; 
    } else {
      window.scrollTo(0, 0);
    }
  }, [debouncedSearchTerm, status]); 

  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set('q', debouncedSearchTerm);
    newParams.set('status', status);
    setSearchParams(newParams, { replace: true });
  }, [debouncedSearchTerm, status, setSearchParams]);

  const queryKey = ['quotations', { q: debouncedSearchTerm, status: status }];
  
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: ({ pageParam }) =>
      getQuotations({ 
        q: debouncedSearchTerm,
        status: status,
        pageParam: pageParam 
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage, 
  });

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        <input
          id="global-search"
          type="search"
          placeholder="Search by client name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {isLoading && <LoadingSpinner />}
        {isError && <ErrorMessage message={(error as Error).message} />}
        
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data.map((q) => (
              <QuotationRow key={q.id} quotation={q} />
            ))}
          </React.Fragment>
        ))}

        {!isLoading && data?.pages[0]?.data.length === 0 && (
          <div className="text-center p-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-900">No Quotations Found</h3>
            <p className="mt-2 text-text-light">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        <div ref={loadMoreRef} className="h-10">
          {isFetchingNextPage && <LoadingSpinner />}
          {!isFetchingNextPage && !hasNextPage && data && data?.pages[0]?.data.length > 0 && (
            <p className="text-center text-text-light">End of results.</p>
          )}
        </div>
      </div>
    </div>
  );
};