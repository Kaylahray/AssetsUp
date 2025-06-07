'use client';

import { useState } from 'react';
import { Package, User, Calendar, MapPin, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

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

interface AssetCheckoutProps {
  asset: Asset;
  onCheckout: (assetId: string, userId: string, dueDate: string, notes?: string) => Promise<void>;
  onCheckin: (assetId: string, notes?: string) => Promise<void>;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
  onClose?: () => void;
}

export default function AssetCheckout({ 
  asset, 
  onCheckout, 
  onCheckin, 
  currentUser,
  onClose 
}: AssetCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isAvailable = asset.status === 'available';
  const isCheckedOutByCurrentUser = asset.currentUser?.id === currentUser?.id;

  const handleCheckout = async () => {
    if (!currentUser || !dueDate) return;

    try {
      setIsLoading(true);
      await onCheckout(asset.id, currentUser.id, dueDate, notes);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose?.();
      }, 2000);
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckin = async () => {
    try {
      setIsLoading(true);
      await onCheckin(asset.id, notes);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose?.();
      }, 2000);
    } catch (error) {
      console.error('Checkin failed:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} />;
      case 'checked-out': return <Clock size={16} />;
      case 'maintenance': return <AlertTriangle size={16} />;
      case 'retired': return <AlertTriangle size={16} />;
      default: return <Package size={16} />;
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isAvailable ? 'Checkout Successful!' : 'Check-in Successful!'}
          </h3>
          <p className="text-gray-600">
            {isAvailable 
              ? `${asset.name} has been checked out to you.`
              : `${asset.name} has been returned successfully.`
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Asset Image */}
      {asset.imageUrl && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={asset.imageUrl} 
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Asset Details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{asset.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{asset.category}</p>
            {asset.serialNumber && (
              <p className="text-sm text-gray-500">S/N: {asset.serialNumber}</p>
            )}
          </div>
          
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
            {getStatusIcon(asset.status)}
            {asset.status.replace('-', ' ')}
          </span>
        </div>

        {asset.description && (
          <p className="text-gray-700 text-sm mb-4">{asset.description}</p>
        )}

        {/* Location */}
        {asset.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin size={16} />
            <span>{asset.location}</span>
          </div>
        )}

        {/* Current Checkout Info */}
        {asset.status === 'checked-out' && asset.currentUser && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Checked out to: {asset.currentUser.name}
              </span>
            </div>
            {asset.checkoutDate && (
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-blue-600" />
                <span className="text-sm text-blue-800">
                  Since: {new Date(asset.checkoutDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {asset.dueDate && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <span className="text-sm text-blue-800">
                  Due: {new Date(asset.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Notes Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this transaction..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Due Date for Checkout */}
        {isAvailable && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isAvailable && currentUser && (
            <button
              onClick={handleCheckout}
              disabled={isLoading || !dueDate}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Checkout Asset'}
            </button>
          )}

          {isCheckedOutByCurrentUser && (
            <button
              onClick={handleCheckin}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Return Asset'}
            </button>
          )}

          {asset.status === 'maintenance' && (
            <div className="flex-1 bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg text-center">
              Asset under maintenance
            </div>
          )}

          {asset.status === 'retired' && (
            <div className="flex-1 bg-red-100 text-red-800 py-2 px-4 rounded-lg text-center">
              Asset retired
            </div>
          )}

          {asset.status === 'checked-out' && !isCheckedOutByCurrentUser && (
            <div className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-center">
              Currently unavailable
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}