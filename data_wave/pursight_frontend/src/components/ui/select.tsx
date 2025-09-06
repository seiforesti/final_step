"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from "@/lib/utils"

// Fixed Select component with proper dropdown behavior
const Select = React.memo(({ 
  children, 
  value, 
  onValueChange, 
  defaultValue, 
  open, 
  onOpenChange,
  ...props 
}: { 
  children: React.ReactNode; 
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: any 
}) => {
  const [isOpen, setIsOpen] = React.useState(open || false);
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');
  const selectRef = React.useRef<HTMLDivElement>(null);

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  const handleValueChange = React.useCallback((newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false); // Close dropdown after selection
  }, [onValueChange]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  return (
    <div 
      ref={selectRef}
      className="relative"
      data-radix-select-root 
      data-state={isOpen ? 'open' : 'closed'}
      data-value={selectedValue}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            selectedValue,
            onOpenChange: handleOpenChange,
            onValueChange: handleValueChange,
            ...child.props
          });
        }
        return child;
      })}
    </div>
  );
});
Select.displayName = "Select"

const SelectGroup = React.memo(({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  return (
    <div data-radix-select-group {...props}>
      {children}
    </div>
  );
});
SelectGroup.displayName = "SelectGroup"

const SelectValue = React.memo(({ 
  placeholder, 
  selectedValue,
  ...props 
}: { 
  placeholder?: string; 
  selectedValue?: string;
  [key: string]: any 
}) => {
  return (
    <span data-radix-select-value {...props}>
      {selectedValue || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.memo(({ 
  className, 
  children, 
  isOpen,
  onOpenChange,
  selectedValue, // Destructure custom props
  onValueChange, // Destructure custom props
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedValue?: string;
  onValueChange?: (value: string) => void;
}) => {
  const handleClick = React.useCallback(() => {
    onOpenChange?.(!isOpen);
  }, [isOpen, onOpenChange]);

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={isOpen}
      onClick={handleClick}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton = React.memo(({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type="button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </button>
  );
});
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.memo(({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type="button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </button>
  );
});
SelectScrollDownButton.displayName = "SelectScrollDownButton"

const SelectContent = React.memo(({ 
  className, 
  children, 
  position = "popper", 
  isOpen,
  selectedValue, // Destructure custom props
  onValueChange, // Destructure custom props
  onOpenChange, // Destructure custom props
  ...props 
}: { 
  className?: string; 
  children: React.ReactNode; 
  position?: string; 
  isOpen?: boolean;
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  [key: string]: any 
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        "top-full left-0 right-0 mt-1",
        className
      )}
      data-radix-select-content
      data-state="open"
      {...props}
    >
      <div className="p-1 max-h-80 overflow-y-auto">
        {children}
      </div>
    </div>
  );
});
SelectContent.displayName = "SelectContent"

const SelectLabel = React.memo(({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      data-radix-select-label
      {...props}
    />
  );
});
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.memo(({ 
  className, 
  children, 
  value,
  selectedValue,
  onValueChange,
  isOpen, // Destructure custom props
  onOpenChange, // Destructure custom props
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const isSelected = value === selectedValue;
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (value && onValueChange) {
      onValueChange(value);
    }
  }, [value, onValueChange]);

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent text-accent-foreground font-medium",
        className
      )}
      data-radix-select-item
      data-state={isSelected ? "checked" : "unchecked"}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.memo(({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      data-radix-select-separator
      {...props}
    />
  );
});
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

