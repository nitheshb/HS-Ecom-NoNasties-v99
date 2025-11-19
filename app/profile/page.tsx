'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserData, updateUserName } from '@/services/read/user';
import { addUserAddress, getUserAddresses, deleteUserAddress } from '@/services/read/user-addresses';
import { Edit2, Plus, Trash2, Info } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserData();
      fetchAddresses();
    }
  }, [user, authLoading]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const userData = await getUserData(user.uid);
      if (userData?.name) {
        setUserName(userData.name);
        setTempName(userData.name);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!user) return;
    
    try {
      const userAddresses = await getUserAddresses(user.uid);
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleSaveName = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      await updateUserName(user.uid, tempName);
      setUserName(tempName);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(userName);
    setIsEditingName(false);
  };

  const handleAddAddress = async () => {
    if (!user) return;
    
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await addUserAddress(user.uid, newAddress);
      await fetchAddresses();
      setShowAddAddress(false);
      setNewAddress({
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        phone: '',
        isDefault: false,
      });
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setSaving(true);
      await deleteUserAddress(user.uid, addressId);
      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <h1 className="text-4xl font-bold mb-8">Profile</h1>

          {/* User Information Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            
            {/* Name Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Enter your name"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="px-4 py-2 bg-[#295A2A] text-white rounded-md hover:bg-[#234624] transition disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={userName || ''}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                      placeholder="No name set"
                    />
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-2 text-gray-600 hover:text-gray-900 transition"
                      aria-label="Edit name"
                    >
                      <Edit2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {/* Addresses Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Addresses</h2>
              {!showAddAddress && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="text-[#295A2A] hover:text-[#234624] font-medium flex items-center gap-1 transition"
                >
                  <Plus size={16} />
                  Add
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-md font-semibold mb-4">Add New Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="Enter state"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="Enter ZIP code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-700">
                      Set as default address
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAddress}
                      disabled={saving}
                      className="px-6 py-2 bg-[#295A2A] text-white rounded-md hover:bg-[#234624] transition disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Address'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddAddress(false);
                        setNewAddress({
                          name: '',
                          street: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          country: 'India',
                          phone: '',
                          isDefault: false,
                        });
                      }}
                      disabled={saving}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses List */}
            {addresses.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Info size={18} />
                <p>No addresses added</p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="p-4 border border-gray-200 rounded-md flex justify-between items-start">
                    <div className="flex-1">
                      {address.isDefault && (
                        <span className="inline-block mb-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                      <p className="font-semibold">{address.name}</p>
                      <p className="text-sm text-gray-600">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                      {address.phone && (
                        <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 text-red-600 hover:text-red-800 transition"
                      aria-label="Delete address"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

