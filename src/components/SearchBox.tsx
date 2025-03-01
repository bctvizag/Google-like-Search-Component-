import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { products, Product } from '../data';

const SearchBox: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const filteredResults = products.filter(product => {
      const itemName = product.ItemName.toLowerCase();
      const uid = product.UID.toLowerCase().trim();
      const pid = product.PID.toString();
      
      return searchTerms.every(term => 
        itemName.includes(term) || 
        uid.includes(term) || 
        pid.includes(term)
      );
    }).slice(0, 10); // Limit to 10 results for performance
    
    setResults(filteredResults);
  }, [query]);

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
        setQuery(selected.ItemName);
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
    // Here you would typically handle the search submission
    console.log('Searching for:', query);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.split(' ').filter(term => term.length > 0).join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <span key={index} className="bg-yellow-200">{part}</span> : part
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
            placeholder="Search for products..."
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
            {results.map((product, index) => (
              <li
                key={product.PID}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  index === selectedIndex ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  setQuery(product.ItemName);
                  setIsSearching(false);
                }}
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{highlightMatch(product.ItemName, query)}</div>
                    <div className="text-sm text-gray-500">
                      PID: {product.PID} | UID: {product.UID.trim()}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    Stock: {product.Balance}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isSearching && query && results.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-700">
            No products found matching "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;