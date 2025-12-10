import React, { useState } from 'react';
import { Bell, Search, User, LogOut, Settings, Moon, Sun, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { branchService } from '../../services/branch.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/utils';

export const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: branchService.getAll,
        // Only fetch if user has permission or just try fetching
        retry: false
    });
    const branches = branchesData?.data || [];

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="h-16 bg-card border-b border-border fixed top-0 right-0 left-64 z-30 transition-all duration-300">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Search */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search students, teachers, courses..."
                            className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border border-transparent focus:border-primary focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Branch Selector */}
                    <div className="flex items-center space-x-2 min-w-[200px]">
                        <Select
                            value={user?.branch?.id || "main"}
                            onValueChange={(value) => {
                                const selectedBranch = branches?.find((b: any) => b.id === value);
                                if (selectedBranch) {
                                    localStorage.setItem('current_branch', JSON.stringify(selectedBranch));
                                    window.location.reload();
                                }
                            }}
                        >
                            <SelectTrigger className="w-full h-9 bg-muted border-none focus:ring-0">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                    <SelectValue placeholder="Select Branch" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {branches?.map((branch: any) => (
                                    <SelectItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        {darkMode ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {getInitials(`${user?.first_name} ${user?.last_name}`)}
                            </div>
                            <div className="text-left hidden md:block">
                                <div className="text-sm font-medium">{user?.first_name} {user?.last_name}</div>
                                <div className="text-xs text-muted-foreground">{user?.role?.name}</div>
                            </div>
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1">
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2">
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </button>
                                <hr className="my-1 border-border" />
                                <button
                                    onClick={logout}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2 text-destructive"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
