'use client';

import { useState } from 'react';
import { QrCode, Scan, Plus, Search, Package } from 'lucide-react';
import QRScanner from './QRScanner';
import QRGenerator from './QRGenerator';
import AssetCheckout from './AssetCheckout';

interface Asset {
  id: string;
  name: string;
  serialNumber?: string;
  category: string;
  status: 'available' | 'checked-out' | 'maintenance' | 'retired';
  location?: string;
  description?: string;
  imageUrl?: string;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
  checkoutDate?: string;
  dueDate?: string;
}

// Mock data - replace with your actual data source
const mockAssets: Asset[] = [
  {
    id: 'laptop-001',
    name: 'MacBook Pro 16"',
    serialNumber: 'MBP16-2024-001',
    category: 'Laptop',
    status: 'available',
    location: 'IT Storage Room A',
    description: 'High-performance laptop for development work',
    imageUrl: '/api/placeholder/300/200'
  },
  {
    id: 'camera-002',
    name: 'Canon EOS R5',
    serialNumber: 'CANR5-2024-002',
    category: 'Camera',
    status: 'checked-out',
    location: 'Photography Studio',
    description: 'Professional mirrorless camera',
    currentUser: {
      id: 'user-456',
      name: 'Jane Smith',
      email: 'jane@company.com'
    },
    checkoutDate: '2024-01-15',
    dueDate: '2024-01-22'
  }
];

const currentUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@company.com'
};

export default function QRAssetManager() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [currentView, setCurrentView] = useState<'list' | 'scanner' | 'generator' | 'checkout'>('list');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQRScan = (data: string) => {
    try {
      const scannedData = JSON.parse(data);
      
      if (scannedData.type === 'asset') {
        const asset = assets.find(a => a.id === scannedData.id);
        if (asset) {
          setSelectedAsset(asset);
          setCurrentView('checkout');
          setMessage(`Found asset: ${asset.name}`);
        } else {
          setMessage('Asset not found in system');
        }
      } else {
        setMessage('Invalid QR code format');
      }
    } catch (error) {
      setMessage('Unable to parse QR code');
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCheckout = async (assetId: string, userId: string, dueDate: string, notes?: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAssets(prev => prev.map(asset =>
      asset.id === assetId
        ? {
            ...asset,
            status: 'checked-out' as const,
            currentUser,
            checkoutDate: new Date().toISOString(),
            dueDate
          }
        : asset
    ));
  };

  const handleCheckin = async (assetId: string, notes?: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAssets(prev => prev.map(asset =>
      asset.id === assetId
        ? {
            ...asset,
            status: 'available' as const,
            currentUser: undefined,
            checkoutDate: undefined,
            dueDate: undefined
          }
        : asset
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'checked-out': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'retired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Asset Manager</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('scanner')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Scan size={16} />
                Scan QR
              </button>
              
              <button
                onClick={() => setCurrentView('generator')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <QrCode size={16} />
                Generate QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className