import { Link } from 'react-router-dom';
import type { Quotation } from '../../../types';
import { Pill } from '../../../components/ui/Pill';
import { Button } from '../../../components/ui/Button';
import { usePermissions } from '../../../hooks/usePermissions';
import { useUpdateStatus } from '../hooks/useUpdateStatus';

interface QuotationRowProps {
  quotation: Quotation;
}

const SCROLL_POSITION_KEY = 'quotationListScrollPos';

export const QuotationRow = ({ quotation }: QuotationRowProps) => {
  const { canApproveReject } = usePermissions();
  const { mutate: updateStatus, isPending } = useUpdateStatus();

  const handleApprove = () => {
    updateStatus({ id: quotation.id, status: 'Approved' });
  };
  
  const handleReject = () => {
    updateStatus({ id: quotation.id, status: 'Rejected' });
  };

  const isActionDisabled = isPending || ['Approved', 'Rejected'].includes(quotation.status);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white shadow rounded-lg gap-4">
      <Link 
        to={`/quotations/${quotation.id}`} 
        className="flex-1 min-w-0"
        onClick={() => {
          sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
        }}
      >
        <div className="flex items-center gap-4">
          <p className="text-lg font-semibold text-text-dark truncate hover:underline">{quotation.client}</p>
          <Pill status={quotation.status} />
        </div>
        <div className="text-sm text-text-light mt-1">
          <span>ID: {quotation.id}</span> | 
          <span className="ml-2">Amount: ${quotation.amount?.toLocaleString() ?? 'N/A'}</span> |
          <span className="ml-2">
            Updated: {new Date(quotation.last_updated).toLocaleDateString()}
          </span>
        </div>
      </Link>
      
      {canApproveReject && (
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            onClick={handleApprove}
            disabled={isActionDisabled || quotation.status === 'Approved'}
            className="bg-green-100 text-green-700 hover:bg-green-200"
          >
            Approve
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={isActionDisabled || quotation.status === 'Rejected'}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};