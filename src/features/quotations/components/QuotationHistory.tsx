import type { HistoryEntry } from '../../../types';

interface QuotationHistoryProps {
  history: HistoryEntry[];
}

const HistoryIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const QuotationHistory = ({ history }: QuotationHistoryProps) => {
  if (!history || history.length === 0) {
    return null; 
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-white shadow rounded-lg mt-6">
      <h3 className="text-lg font-semibold p-4 border-b border-gray-200">
        Change History
      </h3>
      <div className="p-4">
        <ol className="relative border-l border-gray-200">
          {sortedHistory.map((entry) => (
            <li key={entry.id} className="mb-6 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4">
                <HistoryIcon />
              </span>
              <h4 className="flex items-center mb-1 text-md font-semibold text-gray-900">
                {entry.action}
              </h4>
              <time className="block text-sm font-normal leading-none text-gray-400">
                {new Date(entry.timestamp).toLocaleString()} by {entry.user}
              </time>
              {entry.notes && (
                <p className="mt-2 text-sm text-gray-600">{entry.notes}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};