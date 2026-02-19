'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import institutionsData from '@/data/institutions.json';

interface Institution {
  unitid: number;
  name: string;
  city: string;
  state: string;
}

const institutions = institutionsData as Institution[];

interface InstitutionTypeaheadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function InstitutionTypeahead({
  value,
  onChange,
  placeholder = 'Your community college',
  required = false,
}: InstitutionTypeaheadProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [matches, setMatches] = useState<Institution[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync query when value changes externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filterInstitutions = useCallback((q: string) => {
    if (q.length < 2) {
      setMatches([]);
      setIsOpen(false);
      return;
    }
    const lower = q.toLowerCase();
    const results = institutions
      .filter(
        (inst) =>
          inst.name.toLowerCase().includes(lower) ||
          inst.city.toLowerCase().includes(lower)
      )
      .slice(0, 8);
    setMatches(results);
    setIsOpen(results.length > 0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    onChange(q); // allow free-text as the user types
    filterInstitutions(q);
  };

  const handleSelect = (inst: Institution) => {
    setQuery(inst.name);
    onChange(inst.name);
    setIsOpen(false);
    setMatches([]);
  };

  const handleBlur = () => {
    // Keep whatever the user typed (free-text fallback)
    // Dropdown closes via mousedown listener so selection still fires
    setTimeout(() => setIsOpen(false), 150);
  };

  // Close on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        required={required}
        value={query}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-theme-surface border border-theme-base text-theme-primary placeholder:text-theme-muted text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition-colors"
        autoComplete="off"
      />

      {isOpen && matches.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-theme-surface border border-theme-base shadow-lg overflow-hidden">
          {matches.map((inst) => (
            <div
              key={inst.unitid}
              onMouseDown={() => handleSelect(inst)}
              className="px-4 py-2.5 text-sm text-theme-primary hover:bg-purple-500/10 cursor-pointer"
            >
              <span className="font-medium">{inst.name}</span>
              <span className="text-theme-muted text-xs"> — {inst.city}, {inst.state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InstitutionTypeahead;
