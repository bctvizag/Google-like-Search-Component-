import React, { useState } from 'react';
import { Search } from 'lucide-react';
import SearchBox from './components/SearchBox';
import ProductResults from './components/ProductResults';
import { products, Product } from './data';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
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
    });
    
    setSearchResults(filteredResults);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Search className="w-8 h-8 mr-2 text-blue-500" />
              Product Search
            </h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <SearchBox />
          </div>
          
          <ProductResults 
            products={searchResults} 
            searchQuery={searchQuery} 
          />
        </div>
      </main>
    </div>
  );
}

export default App;