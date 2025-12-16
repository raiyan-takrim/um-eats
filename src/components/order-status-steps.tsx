import { Check, Clock, Package, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ClaimStatus = 'PENDING' | 'CONFIRMED' | 'READY' | 'PICKED_UP' | 'CANCELLED' | 'NO_SHOW';

interface OrderStatusStepsProps {
    currentStatus: ClaimStatus;
    className?: string;
}

const steps = [
    {
        status: 'PENDING' as const,
        label: 'Order Placed',
        icon: Clock,
        description: 'Waiting for confirmation',
    },
    {
        status: 'CONFIRMED' as const,
        label: 'Confirmed',
        icon: Check,
        description: 'Organization confirmed',
    },
    {
        status: 'READY' as const,
        label: 'Ready for Pickup',
        icon: Package,
        description: 'Food is ready',
    },
    {
        status: 'PICKED_UP' as const,
        label: 'Collected',
        icon: CheckCircle2,
        description: 'Order completed',
    },
];

const statusOrder: Record<ClaimStatus, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    READY: 2,
    PICKED_UP: 3,
    CANCELLED: -1,
    NO_SHOW: -1,
};

export function OrderStatusSteps({ currentStatus, className }: OrderStatusStepsProps) {
    const currentStep = statusOrder[currentStatus];

    // Show error state for cancelled/no-show
    if (currentStep === -1) {
        return (
            <div className={cn('flex items-center justify-center p-4 rounded-lg bg-red-50 border border-red-200', className)}>
                <div className="text-center">
                    <div className="text-red-600 font-semibold mb-1">
                        {currentStatus === 'CANCELLED' ? 'Order Cancelled' : 'No Show'}
                    </div>
                    <div className="text-sm text-red-600">
                        {currentStatus === 'CANCELLED'
                            ? 'This order has been cancelled'
                            : 'Student did not collect the order'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('w-full', className)}>
            <div className="flex items-center justify-between relative">
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                    <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isPending = index > currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.status} className="flex flex-col items-center flex-1 relative">
                            {/* Circle with icon */}
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                                    {
                                        'bg-green-500 border-green-500 text-white': isCompleted,
                                        'bg-blue-500 border-blue-500 text-white animate-pulse': isCurrent,
                                        'bg-white border-gray-300 text-gray-400': isPending,
                                    }
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </div>

                            {/* Label */}
                            <div className="mt-2 text-center">
                                <div
                                    className={cn(
                                        'text-xs font-medium transition-colors',
                                        {
                                            'text-green-600': isCompleted,
                                            'text-blue-600': isCurrent,
                                            'text-gray-400': isPending,
                                        }
                                    )}
                                >
                                    {step.label}
                                </div>
                                <div
                                    className={cn(
                                        'text-xs mt-0.5 transition-colors',
                                        {
                                            'text-gray-600': isCompleted || isCurrent,
                                            'text-gray-400': isPending,
                                        }
                                    )}
                                >
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
