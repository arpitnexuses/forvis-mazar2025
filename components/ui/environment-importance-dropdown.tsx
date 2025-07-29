"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Environment importance options based on the image
const ENVIRONMENT_IMPORTANCE_LEVELS = [
  "Very Low",
  "Low",
  "Medium",
  "High",
  "Very High"
];

interface EnvironmentImportanceDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function EnvironmentImportanceDropdown({ value, onChange, className, placeholder = "Please select an option" }: EnvironmentImportanceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter environment importance levels based on search term
  const filteredEnvironmentImportanceLevels = ENVIRONMENT_IMPORTANCE_LEVELS.filter(importanceLevel =>
    importanceLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleEnvironmentImportanceSelect = (importanceLevel: string) => {
    onChange(importanceLevel);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleDropdownToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 rounded-md bg-white",
          "focus:outline-none focus:ring-2 focus:ring-[#3B3FA1] focus:border-[#3B3FA1]",
          "hover:border-gray-400 transition-colors duration-200"
        )}
      >
        <span className={cn(value ? "text-gray-900" : "text-gray-500")}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search importance levels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B3FA1] focus:border-[#3B3FA1]"
              />
            </div>
          </div>

          {/* Environment Importance Levels List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredEnvironmentImportanceLevels.length > 0 ? (
              <>
                {filteredEnvironmentImportanceLevels.map((importanceLevel) => (
                  <button
                    key={importanceLevel}
                    type="button"
                    onClick={() => handleEnvironmentImportanceSelect(importanceLevel)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors duration-150",
                      "flex items-center justify-between",
                      value === importanceLevel && "bg-[#3B3FA1]/10 text-[#3B3FA1] font-medium"
                    )}
                  >
                    <span>{importanceLevel}</span>
                    {value === importanceLevel && (
                      <Check className="h-4 w-4 text-[#3B3FA1]" />
                    )}
                  </button>
                ))}
                <div className="h-2"></div>
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No importance levels found matching &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 