// Shared sidebar configuration for Admin Dashboard
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    FileText,
    DollarSign,
    Settings,
    UserPlus,
    Wallet,
    Mail,
    BarChart3,
    Clock,
    Heart,
    Library,
    CalendarDays,
} from "lucide-react";

export const adminSidebarItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={20} />,
    },
    {
        label: "Students",
        href: "/dashboard/admin/students",
        icon: <GraduationCap size={20} />,
    },
    {
        label: "Teachers",
        href: "/dashboard/admin/teachers",
        icon: <Users size={20} />,
    },
    {
        label: "Courses",
        href: "/dashboard/admin/courses",
        icon: <BookOpen size={20} />,
    },
    {
        label: "Attendance",
        href: "/dashboard/admin/attendance",
        icon: <Calendar size={20} />,
    },
    {
        label: "Admissions",
        href: "/dashboard/admin/admissions",
        icon: <UserPlus size={20} />,
    },
    {
        label: "Fees",
        href: "/dashboard/admin/fees",
        icon: <DollarSign size={20} />,
    },
    {
        label: "Payroll",
        href: "/dashboard/admin/payroll",
        icon: <Wallet size={20} />,
    },
    {
        label: "Messages",
        href: "/dashboard/messaging/inbox",
        icon: <Mail size={20} />,
    },
    {
        label: "Timetable",
        href: "/dashboard/admin/timetable",
        icon: <Clock size={20} />,
    },
    {
        label: "Health Records",
        href: "/dashboard/admin/health",
        icon: <Heart size={20} />,
    },
    {
        label: "Library",
        href: "/dashboard/admin/library",
        icon: <Library size={20} />,
    },
    {
        label: "Events",
        href: "/dashboard/admin/events",
        icon: <CalendarDays size={20} />,
    },
    {
        label: "Reports",
        href: "/dashboard/admin/reports",
        icon: <BarChart3 size={20} />,
    },
];

export const teacherSidebarItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={20} />,
    },
    {
        label: "My Courses",
        href: "/dashboard/teacher/courses",
        icon: <BookOpen size={20} />,
    },
    {
        label: "Grades",
        href: "/dashboard/teacher/grades",
        icon: <FileText size={20} />,
    },
    {
        label: "Attendance",
        href: "/dashboard/teacher/attendance",
        icon: <Calendar size={20} />,
    },
];

export const superadminSidebarItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={20} />,
    },
    {
        label: "Management",
        href: "#",
        icon: <Users size={20} />,
        children: [
            {
                label: "Branches",
                href: "/dashboard/superadmin/branches",
                icon: <LayoutDashboard size={18} />,
            },
            {
                label: "Users",
                href: "/dashboard/superadmin/users",
                icon: <Users size={18} />,
            },
            {
                label: "Roles & Permissions",
                href: "/dashboard/superadmin/roles",
                icon: <Users size={18} />,
            },
        ],
    },
    {
        label: "Academic",
        href: "#",
        icon: <GraduationCap size={20} />,
        children: [
            {
                label: "Students",
                href: "/dashboard/superadmin/students",
                icon: <GraduationCap size={18} />,
            },
            {
                label: "Teachers",
                href: "/dashboard/superadmin/teachers",
                icon: <Users size={18} />,
            },
            {
                label: "Courses",
                href: "/dashboard/superadmin/courses",
                icon: <BookOpen size={18} />,
            },
            {
                label: "Attendance",
                href: "/dashboard/admin/attendance",
                icon: <Calendar size={18} />,
            },
        ],
    },
    {
        label: "Admissions",
        href: "/dashboard/admin/admissions",
        icon: <GraduationCap size={20} />,
    },
    {
        label: "Financial",
        href: "#",
        icon: <DollarSign size={20} />,
        children: [
            {
                label: "Fee Management",
                href: "/dashboard/admin/fees",
                icon: <DollarSign size={18} />,
            },
            {
                label: "Payroll",
                href: "/dashboard/admin/payroll",
                icon: <DollarSign size={18} />,
            },
        ],
    },
    {
        label: "Reports",
        href: "/dashboard/admin/reports",
        icon: <BarChart3 size={20} />,
    },
    {
        label: "Messages",
        href: "/dashboard/messaging/inbox",
        icon: <LayoutDashboard size={20} />,
    },
    {
        label: "Analytics",
        href: "/dashboard/superadmin/analytics",
        icon: <BarChart3 size={20} />,
    },
    {
        label: "Settings",
        href: "/dashboard/superadmin/settings",
        icon: <LayoutDashboard size={20} />,
    },
];
