import React from 'react';
import styled from '@emotion/styled';
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { purviewTheme } from '../../theme/purviewTheme';

// Styled components for custom toast
const ToastContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconContainer = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  
  ${({ type }) => {
    switch (type) {
      case 'success':
        return `
          background-color: #DCFCE7;
          color: #166534;
        `;
      case 'error':
        return `
          background-color: #FEE2E2;
          color: #991B1B;
        `;
      case 'warning':
        return `
          background-color: #FEF3C7;
          color: #854D0E;
        `;
      case 'info':
      default:
        return `
          background-color: #E0F2FE;
          color: #0369A1;
        `;
    }
  }}
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${purviewTheme.text};
  margin-bottom: 2px;
`;

const Message = styled.div`
  font-size: 13px;
  color: ${purviewTheme.textSecondary};
`;

// Custom toast component
export const CustomToast: React.FC<{ title: string; message?: string; type: 'success' | 'error' | 'info' | 'warning' }> = ({
  title,
  message,
  type
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck size={16} />;
      case 'error':
        return <FiX size={16} />;
      case 'warning':
        return <FiAlertTriangle size={16} />;
      case 'info':
      default:
        return <FiInfo size={16} />;
    }
  };

  return (
    <ToastContent>
      <IconContainer type={type}>
        {getIcon()}
      </IconContainer>
      <MessageContainer>
        <Title>{title}</Title>
        {message && <Message>{message}</Message>}
      </MessageContainer>
    </ToastContent>
  );
};

// Custom styled ToastContainer
export const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-height: auto;
  }
  
  .Toastify__toast--success {
    background-color: white;
    border-left: 4px solid #16A34A;
  }
  
  .Toastify__toast--error {
    background-color: white;
    border-left: 4px solid #DC2626;
  }
  
  .Toastify__toast--warning {
    background-color: white;
    border-left: 4px solid #D97706;
  }
  
  .Toastify__toast--info {
    background-color: white;
    border-left: 4px solid #0EA5E9;
  }
  
  .Toastify__close-button {
    color: ${purviewTheme.textSecondary};
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }
  
  .Toastify__progress-bar {
    height: 3px;
  }
  
  .Toastify__progress-bar--success {
    background-color: #16A34A;
  }
  
  .Toastify__progress-bar--error {
    background-color: #DC2626;
  }
  
  .Toastify__progress-bar--warning {
    background-color: #D97706;
  }
  
  .Toastify__progress-bar--info {
    background-color: #0EA5E9;
  }
`;

// Helper functions to show toasts
export const showToast = {
  success: (title: string, message?: string) => {
    toast.success(<CustomToast title={title} message={message} type="success" />);
  },
  error: (title: string, message?: string) => {
    toast.error(<CustomToast title={title} message={message} type="error" />);
  },
  info: (title: string, message?: string) => {
    toast.info(<CustomToast title={title} message={message} type="info" />);
  },
  warning: (title: string, message?: string) => {
    toast.warning(<CustomToast title={title} message={message} type="warning" />);
  }
};

// Default export for the toast container
const Toast: React.FC = () => {
  return (
    <StyledToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
};

export default Toast;