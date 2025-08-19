import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { purviewTheme } from '../../theme/purviewTheme';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  width?: string;
}

const DropdownContainer = styled.div<{ width?: string }>`
  position: relative;
  width: ${({ width }) => width || '200px'};
`;

const DropdownLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  color: ${purviewTheme.textSecondary};
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  background: white;
  border: 1px solid ${purviewTheme.border};
  border-radius: 6px;
  font-size: 14px;
  color: ${purviewTheme.text};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${purviewTheme.accent};
  }
  
  &:focus {
    outline: none;
    border-color: ${purviewTheme.accent};
    box-shadow: 0 0 0 2px rgba(230, 46, 27, 0.2);
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 250px;
  overflow-y: auto;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  border: 1px solid ${purviewTheme.border};
`;

const DropdownItem = styled.div<{ isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s ease;
  
  &:hover {
    background: #F9FAFB;
  }
  
  ${({ isSelected }) => isSelected && `
    background: #F9FAFB;
    font-weight: 500;
    color: ${purviewTheme.accent};
  `}
`;

const SelectedText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChevronIcon = styled(FiChevronDown)<{ isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  margin-left: 8px;
  min-width: 16px;
`;

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  width,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <DropdownContainer ref={dropdownRef} width={width}>
      {label && <DropdownLabel>{label}</DropdownLabel>}
      
      <DropdownButton onClick={handleToggle}>
        <SelectedText>
          {selectedOption ? selectedOption.label : placeholder}
        </SelectedText>
        <ChevronIcon size={16} isOpen={isOpen} />
      </DropdownButton>
      
      <DropdownMenu isOpen={isOpen}>
        {options.map(option => (
          <DropdownItem
            key={option.value}
            isSelected={option.value === value}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
            {option.value === value && <FiCheck size={16} color={purviewTheme.accent} />}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
};

export default FilterDropdown;