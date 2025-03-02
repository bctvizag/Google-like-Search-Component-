import React, { useState } from 'react';
import { Search, Users, ShoppingBag } from 'lucide-react';
import SearchBox from './components/SearchBox';
import ProductResults from './components/ProductResults';
import MemberResults from './components/MemberResults';
import { products, Product, members, Member } from './data';

function App() {
  const [activeTab, setActiveTab] = useState<'products' | 'members'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [memberResults, setMemberResults] = useState<Member[]>([]);

  const handleProductSearch = (query: string, results: Product[]) => {
    setSearchQuery(query);
    setSearchResults(results);
  };

  const handleMemberSearch = (query: string, results: Member[]) => {
    setSearchQuery(query);
    setMemberResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Search className="w-8 h-8 mr-2 text-blue-500" />
              Search System
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-md flex items-center ${
                  activeTab === 'products' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Products
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 rounded-md flex items-center ${
                  activeTab === 'members' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Users className="w-5 h-5 mr-2" />
                Members
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'products' && (
            <>
              <div className="mb-8">
                <SearchBox<Product>
                  items={products}
                  onSearch={handleProductSearch}
                  placeholder="Search for products..."
                  searchFields={['ItemName', 'UID', 'PID']}
                  displayFields={['ItemName', 'PID', 'UID']}
                  valueField="ItemName"
                  highlightField="ItemName"
                  rightField="Balance"
                  rightFieldLabel="Stock"
                />
              </div>
              
              <ProductResults 
                products={searchResults} 
                searchQuery={searchQuery} 
              />
            </>
          )}

          {activeTab === 'members' && (
            <>
              <div className="mb-8">
                <SearchBox<Member>
                  items={members}
                  onSearch={handleMemberSearch}
                  placeholder="Search for members..."
                  searchFields={['Name', 'Rank', 'MEMID', 'GNO']}
                  displayFields={['Name', 'MEMID', 'Rank']}
                  valueField="Name"
                  highlightField="Name"
                  rightField="GNO"
                  rightFieldLabel="GNO"
                />
              </div>
              
              <MemberResults 
                members={memberResults} 
                searchQuery={searchQuery} 
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;