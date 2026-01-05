import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getNavigationByRole } from '../../config/roleConfig';
import {
    GraduationCap,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    // Get navigation items based on user role and permissions
    const roleName = user?.role?.name || 'student';
    const navigation = getNavigationByRole(roleName, user?.permissions);

    // Group navigation items
    const groupedNavigation = navigation.reduce((groups, item) => {
        const groupName = item.group || 'main';
        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(item);
        return groups;
    }, {} as Record<string, typeof navigation>);

    // Order of groups
    const groupOrder = ['main', 'Management', 'Academic', 'Teaching', 'Content', 'Learning', 'Performance', 'Finance', 'HR', 'Operations', 'Resources', 'Communication'];

    return (
        <div
            className={cn(
                'fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                {!collapsed && (
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            EduHub
                        </span>
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Role Badge */}
            {!collapsed && (
                <div className="px-4 py-2 border-b border-border">
                    <div className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        roleName.toLowerCase() === 'admin' || roleName.toLowerCase() === 'branchadmin' || roleName.toLowerCase() === 'superadmin'
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : roleName.toLowerCase() === 'teacher'
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    )}>
                        {roleName.charAt(0).toUpperCase() + roleName.slice(1)} Portal
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
                {groupOrder.map(groupName => {
                    const items = groupedNavigation[groupName];
                    if (!items || items.length === 0) return null;

                    return (
                        <div key={groupName}>
                            {/* Group Label */}
                            {groupName !== 'main' && !collapsed && (
                                <div className="px-3 py-2 mt-3 mb-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {groupName}
                                    </span>
                                </div>
                            )}

                            {/* Group Items */}
                            {items.map((item) => {
                                const isActive = location.pathname === item.href ||
                                    location.pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={cn(
                                            'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                            isActive
                                                ? 'bg-primary text-primary-foreground shadow-md'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        )}
                                        title={collapsed ? item.name : undefined}
                                    >
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        {!collapsed && (
                                            <span className="font-medium text-sm">{item.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
};
