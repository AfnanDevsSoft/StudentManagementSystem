import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    ClipboardCheck,
    Award,
    FileText,
    DollarSign,
    Library,
    Heart,
    CalendarDays,
    MessageSquare,
    Bell,
    BarChart3,
    Settings,
    Building2,
    Shield,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Branches', href: '/branches', icon: Building2 },
    { name: 'Roles & Permissions', href: '/roles', icon: Shield },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Students', href: '/students', icon: GraduationCap },
    { name: 'Teachers', href: '/teachers', icon: Users },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Admissions', href: '/admissions', icon: FileText },
    { name: 'Attendance', href: '/attendance', icon: ClipboardCheck },
    { name: 'Grades', href: '/grades', icon: Award },
    { name: 'Payroll', href: '/payroll', icon: DollarSign },
    { name: 'Finance', href: '/finance', icon: DollarSign },
    { name: 'Library', href: '/library', icon: Library },
    { name: 'Health Records', href: '/health', icon: Heart },
    { name: 'Events', href: '/events', icon: CalendarDays },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Announcements', href: '/announcements', icon: Bell },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

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

            {/* Navigation */}
            <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                {navigation.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
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
            </nav>
        </div>
    );
};
