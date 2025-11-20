'use client';

import { CheckCircle2, Circle, Package, Truck, Home } from 'lucide-react';

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | string;

interface OrderStatusProgressProps {
  status: OrderStatus;
  className?: string;
}

// Map various status values to our standard flow
const normalizeStatus = (status: string | undefined): OrderStatus => {
  if (!status) return 'placed';
  
  const statusLower = status.toLowerCase();
  
  // Map to standard flow
  if (statusLower === 'new' || statusLower === 'order received' || statusLower === 'orderreceived') {
    return 'placed';
  }
  if (statusLower === 'packed' || statusLower === 'packing') {
    return 'packed';
  }
  if (statusLower === 'shipped' || statusLower === 'shipping' || statusLower === 'out for delivery') {
    return 'shipped';
  }
  if (statusLower === 'delivered' || statusLower === 'completed') {
    return 'delivered';
  }
  if (statusLower === 'cancelled' || statusLower === 'canceled') {
    return 'cancelled';
  }
  
  // Default to placed if unknown
  return 'placed';
};

const STATUS_STEPS = [
  { key: 'placed', label: 'Placed', icon: Circle },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
] as const;

export default function OrderStatusProgress({ status, className = '' }: OrderStatusProgressProps) {
  const normalizedStatus = normalizeStatus(status);
  
  // Don't show progress for cancelled orders
  if (normalizedStatus === 'cancelled') {
    return null;
  }
  
  const currentStepIndex = STATUS_STEPS.findIndex(step => step.key === normalizedStatus);
  const activeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  
  return (
    <div className={`order-status-progress ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < activeStepIndex;
          const isActive = index === activeStepIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative">
              {/* Step Circle */}
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : isActive
                  ? 'bg-yellow-500 border-yellow-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 size={20} className="text-white" />
                ) : (
                  <Icon size={20} />
                )}
              </div>
              
              {/* Step Label */}
              <span className={`mt-2 text-xs font-medium text-center ${
                isCompleted || isActive
                  ? 'text-gray-900'
                  : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              
              {/* Connecting Line */}
              {index < STATUS_STEPS.length - 1 && (
                <div className={`absolute top-5 left-1/2 w-full h-0.5 z-0 ${
                  index < activeStepIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`} style={{ width: 'calc(100% - 2.5rem)', marginLeft: '2.5rem' }} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Status Badge */}
      <div className="mt-4 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          normalizedStatus === 'delivered'
            ? 'bg-green-100 text-green-800'
            : normalizedStatus === 'shipped'
            ? 'bg-blue-100 text-blue-800'
            : normalizedStatus === 'packed'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {STATUS_STEPS[activeStepIndex]?.label || 'Placed'}
        </span>
      </div>
    </div>
  );
}

