import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { TeacherProfileError } from '../../components/teacher/TeacherProfileError';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { payrollService } from '../../services/payroll.service';
import {
    DollarSign,
    Download,
    CreditCard,
    TrendingUp,
    Clock,
    Loader2,
} from 'lucide-react';

export const TeacherPayrollPage: React.FC = () => {
    const { user } = useAuth();
    const teacherId = user?.teacherId;

    const { data: payrollsData, isLoading } = useQuery({
        queryKey: ['teacher-payroll', teacherId],
        queryFn: () => payrollService.getByTeacher(teacherId!),
        enabled: !!teacherId,
    });

    const payrolls = Array.isArray(payrollsData?.data) ? payrollsData.data : (Array.isArray(payrollsData) ? payrollsData : []);

    const stats = React.useMemo(() => {
        const salaryData = payrolls || [];
        const ytdSalary = salaryData.reduce((sum: number, p: any) => sum + (Number(p.net_salary) || 0), 0);
        const lastPayment = salaryData.length > 0 ? Number(salaryData[0].net_salary) || 0 : 0;
        const average = salaryData.length > 0 ? ytdSalary / salaryData.length : 0;
        const pending = salaryData.filter((p: any) => p.status === 'Pending').length;

        return {
            ytdSalary,
            lastMonth: lastPayment,
            average,
            pending,
        };
    }, [payrolls]);

    if (!teacherId) {
        return (
            <MainLayout>
                <TeacherProfileError />
            </MainLayout>
        );
    }

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading payroll data...</span>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Payroll</h1>
                        <p className="text-muted-foreground mt-1">
                            View your salary history and payslips
                        </p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Annual Statement
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">YTD Earnings</p>
                                    <h3 className="text-2xl font-bold mt-1">${stats.ytdSalary.toLocaleString()}</h3>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Payment</p>
                                    <h3 className="text-2xl font-bold mt-1">${stats.lastMonth.toLocaleString()}</h3>
                                </div>
                                <CreditCard className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Monthly</p>
                                    <h3 className="text-2xl font-bold mt-1">${stats.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                                </div>
                                <TrendingUp className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.pending}</h3>
                                </div>
                                <Clock className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payroll History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payrolls.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-medium">Month/Year</th>
                                            <th className="text-left p-4 font-medium">Payment Date</th>
                                            <th className="text-left p-4 font-medium">Basic Salary</th>
                                            <th className="text-left p-4 font-medium">Additions</th>
                                            <th className="text-left p-4 font-medium">Deductions</th>
                                            <th className="text-left p-4 font-medium">Net Pay</th>
                                            <th className="text-left p-4 font-medium">Status</th>
                                            <th className="text-right p-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrolls.map((record: any) => (
                                            <tr key={record.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4 font-medium">
                                                    {record.month ? `${new Date(0, record.month - 1).toLocaleString('default', { month: 'long' })} ${record.year}` : 'N/A'}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="p-4">${Number(record.salary_amount || 0).toLocaleString()}</td>
                                                <td className="p-4 text-green-600">+${Number(record.bonus || 0).toLocaleString()}</td>
                                                <td className="p-4 text-red-600">-${Number(record.deductions || 0).toLocaleString()}</td>
                                                <td className="p-4 font-bold">${Number(record.net_salary || 0).toLocaleString()}</td>
                                                <td className="p-4">
                                                    <Badge
                                                        className={
                                                            record.status === 'Paid'
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : record.status === 'Pending'
                                                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                        }
                                                        variant="outline"
                                                    >
                                                        {record.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No payment history available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};
