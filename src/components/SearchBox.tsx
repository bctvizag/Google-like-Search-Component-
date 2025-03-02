import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchItem {
  [key: string]: any;
}

interface SearchBoxProps<T extends SearchItem> {
  items: T[];
  onSearch?: (query: string, results: T[]) => void;
  placeholder?: string;
  searchFields: string[];
  displayFields: string[];
  valueField?: string;
  maxResults?: number;
  highlightField?: string;
  rightField?: string;
  rightFieldLabel?: string;
}

function SearchBox<T extends SearchItem>({
  items,
  onSearch,
  placeholder = "Search...",
  searchFields,
  displayFields,
  valueField,
  maxResults = 10,
  highlightField,
  rightField,
  rightFieldLabel
}: SearchBoxProps<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevQueryRef = useRef<string>(query);

  useEffect(() => {
    // Skip if the query hasn't changed to prevent infinite loops
    if (prevQueryRef.current === query) {
      return;
    }
    
    prevQueryRef.current = query;

    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const filteredResults = items.filter(item => {
      return searchTerms.every(term => 
        searchFields.some(field => {
          const value = String(item[field] || '').toLowerCase();
          return value.includes(term);
        })
      );
    }).slice(0, maxResults);
    
    setResults(filteredResults);
    
    if (onSearch) {
      onSearch(query, filteredResults);
    }
  }, [query, items, searchFields, maxResults, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        setQuery(valueField ? String(selected[valueField] || '') : String(selected[displayFields[0]] || ''));
        setIsSearching(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearching(false);
    }
  };

  const handleFocus = () => {
    setIsSearching(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.split(' ').filter(term => term.length > 0).join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <span key={`highlight-${index}`} className="bg-yellow-200">{part}</span> : part
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-10 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <span className="text-xl font-medium">×</span>
            </button>
          )}
        </div>
        <button type="submit" className="hidden">Search</button>
      </form>

      {isSearching && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <ul className="py-1 overflow-auto text-base max-h-60">
            {results.map((item, index) => {
              // Create a unique key for each item
              const itemKey = `result-${index}-${item[displayFields[0]] || index}`;
              
              return (
                <li
                  key={itemKey}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === selectedIndex ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => {
                    const selectedValue = valueField 
                      ? String(item[valueField] || '') 
                      : String(item[displayFields[0]] || '');
                    setQuery(selectedValue);
                    setIsSearching(false);
                    if (onSearch) {
                      onSearch(selectedValue, [item]);
                    }
                  }}
                >
                  <div className="flex justify-between">
                    <div>
                      {displayFields.map((field, idx) => {
                        const fieldKey = `${itemKey}-field-${idx}`;
                        return (
                          <div key={fieldKey} className={idx === 0 ? "font-medium" : "text-sm text-gray-500"}>
                            {idx === 0 && highlightField 
                              ? highlightMatch(String(item[highlightField] || ''), query) 
                              : idx === 0 
                                ? highlightMatch(String(item[field] || ''), query)
                                : `${field.replace(/([A-Z])/g, ' $1').trim()}: ${String(item[field] || '')}`}
                          </div>
                        );
                      })}
                    </div>
                    {rightField && item[rightField] !== undefined && (
                      <div className="text-sm font-semibold text-blue-600">
                        {rightFieldLabel ? `${rightFieldLabel}: ` : ''}{String(item[rightField])}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isSearching && query && results.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-700">
            No results found matching "{query}"
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBox;