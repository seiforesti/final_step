import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 1rem 0;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 0.5rem;
  color: #e53e3e;
`;

const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.25rem;
`;

const ErrorIcon = styled(FiAlertTriangle)`
  margin-right: 0.5rem;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c53030;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.5);
  }
`;

const RefreshIcon = styled(FiRefreshCw)`
  margin-right: 0.5rem;
`;

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  error?: unknown;
  resetError?: () => void;
}

const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({
  children,
  fallback,
  error,
  resetError,
}) => {
  const [hasError, setHasError] = useState<boolean>(!!error);

  useEffect(() => {
    setHasError(!!error);
  }, [error]);

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  if (!hasError) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <ErrorContainer>
      <ErrorHeader>
        <ErrorIcon />
        Connection Error
      </ErrorHeader>
      <ErrorMessage>
        We're having trouble connecting to the server. This might be due to network issues or the server might be down.
      </ErrorMessage>
      <RefreshButton onClick={handleRefresh}>
        <RefreshIcon />
        Refresh
      </RefreshButton>
    </ErrorContainer>
  );
};

export default ApiErrorBoundary;