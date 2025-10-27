// src/components/ui/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
}
export const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <div className="p-4 rounded-md bg-red-50 text-red-700">
    <p>
      <strong>Error:</strong> {message}
    </p>
  </div>
);