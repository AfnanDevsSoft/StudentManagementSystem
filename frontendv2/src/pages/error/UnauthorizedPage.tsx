import React from 'react';
import { Button } from '../../components/ui/button';
import { MainLayout } from '../../components/layout/MainLayout';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-6">
                    <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    You do not have permission to access this page. If you believe this is an error, please contact your administrator.
                </p>

                <div className="flex gap-4">
                    <Button asChild variant="default">
                        <a href="/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Dashboard
                        </a>
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
};
