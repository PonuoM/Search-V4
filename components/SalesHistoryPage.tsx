
import React, { useState, useMemo, useCallback } from 'react';
import type { SalesHistoryRecord } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { SearchIcon } from './icons/SearchIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { TableCellsIcon } from './icons/TableCellsIcon';
import { TrashIcon } from './icons/TrashIcon';

interface Customer {
  phone: string;
  name: string;
  facebookName?: string;
  address: string;
  totalSpent: number;
  orderCount: number;
}

interface SalesHistoryPageProps {
  allRecords: SalesHistoryRecord[] | null;
  isLoading: boolean;
  error: string | null;
}


// --- Sub-components for better readability ---

const CustomerSummaryCard: React.FC<{ customer: Customer }> = ({ customer }) => (
    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <UserCircleIcon className="h-16 w-16 text-sky-500 dark:text-sky-400 shrink-0"/>
            <div className="flex-grow">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{customer.name}</h3>
                <p className="text-slate-600 dark:text-slate-400">{customer.phone}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">{customer.address}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 text-right w-full sm:w-auto mt-4 sm:mt-0">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">ยอดรวม</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{customer.totalSpent.toLocaleString('th-TH')} บาท</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">จำนวนครั้งที่สั่ง</p>
                    <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{customer.orderCount}</p>
                </div>
            </div>
        </div>
    </div>
);

const HistoryTable: React.FC<{ records: SalesHistoryRecord[]; dateFilter: 'all' | '3months' }> = ({ records, dateFilter }) => {
    const ninetyDaysAgo = useMemo(() => {
        const date = new Date();
        // Normalize to start of day to avoid off-by-one from time components
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - 90);
        return date;
    }, []);

    return (
        <div>
            <h4 className="text-xl font-semibold mb-4 flex items-center text-slate-700 dark:text-slate-300">
                <TableCellsIcon className="h-6 w-6 mr-3"/> ประวัติการสั่งซื้อ
            </h4>
            <div className="overflow-x-auto bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-200/60 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                        <tr>
                            <th className="px-4 py-3 font-semibold">วันที่ขาย</th>
                            <th className="px-4 py-3 font-semibold">สินค้า</th>
                            <th className="px-4 py-3 font-semibold text-right">จำนวน</th>
                            <th className="px-4 py-3 font-semibold text-right">ราคา</th>
                            <th className="px-4 py-3 font-semibold">พนักงานขาย</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 dark:divide-white/10 text-slate-800 dark:text-slate-300">
                        {records.length > 0 ? records.map((item, index) => {
                             const isRecent = dateFilter === 'all' && item['วันที่ขาย'] >= ninetyDaysAgo;
                             const rowClasses = `transition-colors duration-150 ${
                                 isRecent 
                                 ? 'bg-sky-100/60 dark:bg-sky-500/10 hover:bg-sky-200/60 dark:hover:bg-sky-500/20' 
                                 : 'hover:bg-slate-200/40 dark:hover:bg-white/5'
                             }`;

                            return (
                                <tr key={index} className={rowClasses}>
                                    <td className="px-4 py-3 whitespace-nowrap">{item['วันที่ขาย'].toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                    <td className="px-4 py-3">{item['สินค้า'] || '-'}</td>
                                    <td className="px-4 py-3 text-right">{item['จำนวน'] ?? '-'}</td>
                                    <td className="px-4 py-3 text-right">{item['ราคา']?.toLocaleString('th-TH') ?? '-'}</td>
                                    <td className="px-4 py-3">{item['พนักงานขาย'] || '-'}</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">ไม่พบข้อมูลการซื้อในระยะเวลาที่เลือก</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export const SalesHistoryPage: React.FC<SalesHistoryPageProps> = ({ allRecords, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Customer[] | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '3months'>('all');

  const uniqueCustomers = useMemo((): Customer[] => {
    if (!allRecords) return [];
    const customerMap = new Map<string, { records: SalesHistoryRecord[] }>();
    
    // Only group records that have a phone number for this customer-centric view
    allRecords.forEach(r => {
      if (r['เบอร์โทร']) {
        const phone = r['เบอร์โทร'];
        if (!customerMap.has(phone)) {
          customerMap.set(phone, { records: [] });
        }
        customerMap.get(phone)!.records.push(r);
      }
    });

    return Array.from(customerMap.entries()).map(([phone, data]) => {
      const sortedRecords = data.records.sort((a, b) => b['วันที่ขาย'].getTime() - a['วันที่ขาย'].getTime());
      const latestRecord = sortedRecords[0];
      const totalSpent = data.records.reduce((sum, r) => sum + (r['ราคา'] || 0), 0);
      const orderDates = new Set(data.records.map(r => r['วันที่ขาย'].toDateString()));
      return {
        phone,
        name: latestRecord['ชื่อผู้รับ'] || latestRecord['ชื่อ Facebook'] || 'Unknown',
        facebookName: latestRecord['ชื่อ Facebook'],
        address: `${latestRecord['ที่อยู่'] || ''} ${latestRecord['ตำบล'] || ''} ${latestRecord['อำเภอ'] || ''} ${latestRecord['จังหวัด'] || ''} ${latestRecord['รหัสไปรษณีย์'] || ''}`.trim() || 'ไม่มีข้อมูลที่อยู่',
        totalSpent,
        orderCount: orderDates.size,
      };
    });
  }, [allRecords]);

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Clear previous results when user types a new query
    if (selectedCustomer) {
        setSelectedCustomer(null);
    }
    setSearchResults(null);
  };

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = uniqueCustomers.filter(c =>
      c.phone.includes(searchTerm.replace(/\D/g, '')) ||
      c.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      (c.facebookName || '').toLowerCase().includes(lowerCaseSearchTerm)
    );
    if (results.length === 1) {
      setSelectedCustomer(results[0]);
      setSearchResults(null);
    } else {
      setSelectedCustomer(null);
      setSearchResults(results);
    }
  }, [searchTerm, uniqueCustomers]);

  const handleSelectResult = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchResults(null); 
    setSearchTerm(customer.name);
  };

  const clearAll = () => {
    setSearchTerm('');
    setSearchResults(null);
    setSelectedCustomer(null);
  };
  
  const filteredRecords = useMemo(() => {
    if (!selectedCustomer || !allRecords) return [];
    
    const customerRecords = allRecords
        .filter(r => r['เบอร์โทร'] === selectedCustomer.phone)
        .sort((a, b) => b['วันที่ขาย'].getTime() - a['วันที่ขาย'].getTime());

    if (dateFilter === '3months') {
        const threshold = new Date();
        // Normalize threshold to start of day
        threshold.setHours(0, 0, 0, 0);
        threshold.setDate(threshold.getDate() - 90);
        return customerRecords.filter(r => {
            // Compare using start-of-day for each sale date
            const sale = r['วันที่ขาย'];
            const saleStartOfDay = new Date(sale.getFullYear(), sale.getMonth(), sale.getDate());
            return saleStartOfDay >= threshold;
        });
    }

    return customerRecords;
  }, [selectedCustomer, allRecords, dateFilter]);


  return (
    <main className="container mx-auto mt-4 mb-8 p-4 sm:p-6 lg:p-8 w-full max-w-5xl bg-slate-100/80 dark:bg-black/20 backdrop-blur-2xl shadow-2xl rounded-3xl border border-slate-200 dark:border-white/10 relative">
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      
      {!isLoading && !error && allRecords && (
        <div className="animate-fadeIn space-y-6">
            <div className="p-4 bg-slate-200/30 dark:bg-black/10 rounded-2xl space-y-4 border border-slate-300/50 dark:border-white/10">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-grow">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="ค้นหาด้วยชื่อ, ชื่อ Facebook, หรือเบอร์โทรศัพท์..."
                    className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-black/30 border-2 border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 backdrop-blur-sm"
                    autoComplete="off"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!searchTerm.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <SearchIcon className="h-5 w-5"/>
                  ค้นหา
                </button>
                 <button
                  onClick={clearAll}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 font-semibold rounded-xl transition-colors duration-150 flex items-center justify-center gap-2"
                  title="ล้างข้อมูล"
                >
                  <TrashIcon className="h-5 w-5"/>
                </button>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      แสดงผล:
                  </label>
                  <div className="flex bg-slate-200/50 dark:bg-black/20 p-1 rounded-xl gap-2">
                      <button 
                          onClick={() => setDateFilter('all')}
                          className={`px-4 py-1.5 font-semibold text-xs rounded-lg transition-all duration-200 ${dateFilter === 'all' ? 'bg-white dark:bg-slate-700 shadow text-sky-600 dark:text-white' : 'text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-white/10'}`}
                      >
                          ดูข้อมูลทั้งหมด
                      </button>
                      <button 
                          onClick={() => setDateFilter('3months')}
                          className={`px-4 py-1.5 font-semibold text-xs rounded-lg transition-all duration-200 ${dateFilter === '3months' ? 'bg-white dark:bg-slate-700 shadow text-sky-600 dark:text-white' : 'text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-white/10'}`}
                      >
                          ดูย้อนหลัง 3 เดือน
                      </button>
                  </div>
              </div>
            </div>
            
            {/* Display Area */}
            <div className="mt-6">
                {selectedCustomer && (
                    <div className="animate-fadeIn space-y-6">
                        <CustomerSummaryCard customer={selectedCustomer} />
                        <HistoryTable records={filteredRecords} dateFilter={dateFilter} />
                    </div>
                )}

                {searchResults && searchResults.length > 1 && !selectedCustomer && (
                    <div className="animate-fadeIn">
                        <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">พบผลลัพธ์ {searchResults.length} รายการ กรุณาเลือก:</h3>
                        <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                            {searchResults.map(customer => (
                                <li
                                    key={customer.phone}
                                    onClick={() => handleSelectResult(customer)}
                                    className="p-4 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-lg shadow-md border border-slate-200 dark:border-white/10 cursor-pointer hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all"
                                >
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{customer.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{customer.phone}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {searchResults && searchResults.length === 0 && (
                     <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        <p>ไม่พบข้อมูลลูกค้าที่ตรงกับ "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}} />
    </main>
  );
};
