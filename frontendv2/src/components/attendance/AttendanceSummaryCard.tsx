import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export interface AttendanceSummaryCardProps {
    summary: {
        total_working_days: number;
        days_present: number;
        days_absent: number;
        days_late: number;
        days_excused: number;
        attendance_percentage: number;
        meets_minimum: boolean;
        last_calculated: string;
    };
    entityType?: 'student' | 'teacher';
    showDetails?: boolean;
}

export const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({
    summary,
    entityType = 'student',
    showDetails = true,
}) => {
    const percentageColor = summary.meets_minimum ? 'text-green-600' : 'text-red-600';
    const progressColor = summary.meets_minimum ? 'bg-green-500' : 'bg-red-500';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Attendance Summary
                    </span>
                    <Badge variant={summary.meets_minimum ? 'success' : 'destructive'}>
                        {summary.meets_minimum ? 'Meets 80% Minimum' : 'Below 80% Minimum'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Percentage Display */}
                <div className="text-center space-y-2">
                    <div className={`text-4xl font-bold ${percentageColor}`}>
                        {summary.attendance_percentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {summary.days_present} out of {summary.total_working_days} working days
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress value={summary.attendance_percentage} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span className="font-semibold">80% Minimum</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                {showDetails && (
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <div>
                                <p className="text-sm font-medium">{summary.days_present}</p>
                                <p className="text-xs text-muted-foreground">Present</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <div>
                                <p className="text-sm font-medium">{summary.days_absent}</p>
                                <p className="text-xs text-muted-foreground">Absent</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <div>
                                <p className="text-sm font-medium">{summary.days_late}</p>
                                <p className="text-xs text-muted-foreground">Late</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium">{summary.days_excused}</p>
                                <p className="text-xs text-muted-foreground">Excused</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Last Updated */}
                <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                        Last updated: {new Date(summary.last_calculated).toLocaleString()}
                    </p>
                </div>

                {/* Warning Message */}
                {!summary.meets_minimum && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-800">
                            <p className="font-semibold">Attendance Below Minimum</p>
                            <p>
                                {entityType === 'student' ? 'This student' : 'You'} must maintain at least 80%
                                attendance. Current attendance is below the required minimum.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AttendanceSummaryCard;
