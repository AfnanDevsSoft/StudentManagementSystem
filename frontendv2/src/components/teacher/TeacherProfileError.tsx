import React from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherProfileError: React.FC = () => {
    const { logout } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <div className="text-center py-12 max-w-md mx-auto">
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full w-fit mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Profile Connection Issue</h2>
                <p className="text-muted-foreground mb-8">
                    Your user account is not correctly linked to a teacher profile.
                    This often happens after system updates. Please try logging out and back in.
                </p>
                <Button onClick={logout} variant="destructive" className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout & Refresh Session
                </Button>
            </div>
        </div>
    );
};
