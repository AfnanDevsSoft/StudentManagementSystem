import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="ml-64 transition-all duration-300">
                <Header />
                <main className="pt-16 min-h-screen">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
