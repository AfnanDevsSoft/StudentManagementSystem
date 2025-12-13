import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfileError } from '../../components/student/StudentProfileError';
import { studentService } from '../../services/student.service';
import {
    DollarSign,
    CreditCard,
    Clock,
    CheckCircle,
    AlertCircle,
    Download,
    Calendar,
    Loader2,
} from 'lucide-react';

export const StudentFeesPage: React.FC = () => {
    const { user } = useAuth();
    const studentId = user?.studentId;

    // Fetch student fees
    const { data: feesData, isLoading: loadingFees, error: feesError } = useQuery({
        queryKey: ['student-fees', studentId],
        queryFn: () => studentService.getFees(studentId!),
        enabled: !!studentId,
    });

    // Fetch payment history
    const { data: historyData, isLoading: loadingHistory } = useQuery({
        queryKey: ['student-payment-history', studentId],
        queryFn: () => studentService.getPaymentHistory(studentId!),
        enabled: !!studentId,
    });

    const isLoading = loadingFees || loadingHistory;

    const fees = feesData?.data || feesData || {};
    const paymentHistory = historyData?.data || historyData || [];

    // Calculate totals
    const totalFees = fees.total_fees || fees.totalFees || fees.total || 0;
    const paidAmount = fees.paid_amount || fees.paidAmount || fees.paid || 0;
    const pendingAmount = fees.outstanding || fees.pending_amount || fees.pendingAmount || fees.pending || (totalFees - paidAmount);
    const dueDate = fees.due_date || fees.dueDate || fees.next_due_date || 'Not specified';

    // Extract fee items from the response
    const feeItems = fees.items || fees.fee_items || fees.feeItems || [];
    const payments = Array.isArray(paymentHistory) ? paymentHistory : [];

    if (!studentId) {
        return <StudentProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Fee Status</h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage your fee payments
                        </p>
                    </div>
                    <Button disabled={pendingAmount <= 0}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                    </Button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading fee details...</span>
                    </div>
                )}

                {/* Error State */}
                {feesError && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold">Failed to load fees</h2>
                        <p className="text-muted-foreground mt-2">
                            {(feesError as Error).message || 'An error occurred while fetching your fee details.'}
                        </p>
                    </div>
                )}

                {/* Content */}
                {!isLoading && !feesError && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Fees</p>
                                            <h3 className="text-2xl font-bold mt-1">${totalFees.toLocaleString()}</h3>
                                        </div>
                                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                            <DollarSign className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Paid Amount</p>
                                            <h3 className="text-2xl font-bold mt-1 text-green-600">${paidAmount.toLocaleString()}</h3>
                                        </div>
                                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={pendingAmount > 0 ? 'border-orange-200' : ''}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Pending Amount</p>
                                            <h3 className="text-2xl font-bold mt-1 text-orange-600">${pendingAmount.toLocaleString()}</h3>
                                        </div>
                                        <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                                            <Clock className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Due Date</p>
                                            <h3 className="text-lg font-bold mt-1">
                                                {typeof dueDate === 'string' && dueDate !== 'Not specified'
                                                    ? new Date(dueDate).toLocaleDateString()
                                                    : dueDate
                                                }
                                            </h3>
                                        </div>
                                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                                            <Calendar className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Alert */}
                        {pendingAmount > 0 && (
                            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-6 h-6 text-orange-600" />
                                            <div>
                                                <h4 className="font-medium text-orange-800 dark:text-orange-400">Payment Due</h4>
                                                <p className="text-sm text-orange-600">
                                                    You have ${pendingAmount.toLocaleString()} pending. Please pay before the due date to avoid late fees.
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                            Pay Now
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Fee Breakdown & Payment History */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Fee Breakdown */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Fee Breakdown</CardTitle>
                                    <Button variant="outline" size="sm" disabled>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Invoice
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {Array.isArray(feeItems) && feeItems.length > 0 ? (
                                        <div className="space-y-3">
                                            {feeItems.map((fee: any, index: number) => (
                                                <div
                                                    key={fee.id || index}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                                >
                                                    <div>
                                                        <p className="font-medium">{fee.type || fee.name || fee.fee_type || 'Fee'}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {fee.status === 'paid'
                                                                ? `Paid on ${fee.paid_date ? new Date(fee.paid_date).toLocaleDateString() : 'N/A'}`
                                                                : `Due: ${fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'N/A'}`
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold">${(fee.amount || 0).toLocaleString()}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${fee.status === 'paid'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                                            }`}>
                                                            {fee.status === 'paid' ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No fee breakdown available</p>
                                            {(totalFees > 0 || pendingAmount > 0) && (
                                                <p className="text-sm mt-2">
                                                    Contact administration for detailed fee information.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Payment History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {payments.length > 0 ? (
                                        <div className="space-y-3">
                                            {payments.map((payment: any, index: number) => (
                                                <div
                                                    key={payment.id || index}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                                >
                                                    <div>
                                                        <p className="font-medium">${(payment.amount || payment.amount_paid || 0).toLocaleString()}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {payment.date || payment.payment_date
                                                                ? new Date(payment.date || payment.payment_date).toLocaleDateString()
                                                                : 'N/A'
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm">{payment.method || payment.payment_method || 'Payment'}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {payment.reference || payment.transaction_id || payment.receipt_number || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No payment history found</p>
                                        </div>
                                    )}
                                    {payments.length > 0 && (
                                        <Button variant="outline" className="w-full mt-4" disabled>
                                            View All Transactions
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* All Paid Message */}
                        {pendingAmount <= 0 && totalFees > 0 && (
                            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        <div>
                                            <h4 className="font-medium text-green-800 dark:text-green-400">All Fees Paid</h4>
                                            <p className="text-sm text-green-600">
                                                Great job! You have no outstanding fees. Your account is up to date.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};
