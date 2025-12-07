// Single unified sidebar configuration for ALL users
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
    Building2,
    Shield,
    TrendingUp,
} from "lucide-react";

// ONE UNIFIED SIDEBAR - All routes in one place
export const unifiedSidebarItems = [
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
                href: "/dashboard/branches",
                icon: <Building2 size={18} />,
            },
            {
                label: "Users",
                href: "/dashboard/users",
                icon: <Users size={18} />,
            },
            {
                label: "Roles & Permissions",
                href: "/dashboard/roles",
                icon: <Shield size={18} />,
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
                href: "/dashboard/students",
                icon: <GraduationCap size={18} />,
            },
            {
                label: "Teachers",
                href: "/dashboard/teachers",
                icon: <Users size={18} />,
            },
            {
                label: "Courses",
                href: "/dashboard/courses",
                icon: <BookOpen size={18} />,
            },
            {
                label: "Attendance",
                href: "/dashboard/attendance",
                icon: <Calendar size={18} />,
            },
            {
                label: "Timetable",
                href: "/dashboard/timetable",
                icon: <Clock size={18} />,
            },
        ],
    },
    {
        label: "Admissions",
        href: "/dashboard/admissions",
        icon: <UserPlus size={20} />,
    },
    {
        label: "Financial",
        href: "#",
        icon: <DollarSign size={20} />,
        children: [
            {
                label: "Fees",
                href: "/dashboard/fees",
                icon: <DollarSign size={18} />,
            },
            {
                label: "Payroll",
                href: "/dashboard/payroll",
                icon: <Wallet size={18} />,
            },
        ],
    },
    {
        label: "Health & Wellness",
        href: "#",
        icon: <Heart size={20} />,
        children: [
            {
                label: "Health Records",
                href: "/dashboard/health",
                icon: <Heart size={18} />,
            },
        ],
    },
    {
        label: "Resources",
        href: "#",
        icon: <Library size={20} />,
        children: [
            {
                label: "Library",
                href: "/dashboard/library",
                icon: <Library size={18} />,
            },
            {
                label: "Events",
                href: "/dashboard/events",
                icon: <CalendarDays size={18} />,
            },
        ],
    },
    {
        label: "Reports & Analytics",
        href: "#",
        icon: <BarChart3 size={20} />,
        children: [
            {
                label: "Reports",
                href: "/dashboard/reports",
                icon: <FileText size={18} />,
            },
            {
                label: "Analytics",
                href: "/dashboard/analytics",
                icon: <TrendingUp size={18} />,
            },
        ],
    },
    {
        label: "Messages",
        href: "/dashboard/messaging/inbox",
        icon: <Mail size={20} />,
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: <Settings size={20} />,
    },
];

// Export the unified sidebar as default for all roles
export const getSidebarForRole = () => {
    return unifiedSidebarItems;
};

// Keep these exports for backward compatibility (they all return the same sidebar now)
export const adminSidebarItems = unifiedSidebarItems;
export const teacherSidebarItems = unifiedSidebarItems;
export const superadminSidebarItems = unifiedSidebarItems;
export const studentSidebarItems = unifiedSidebarItems;
export const parentSidebarItems = unifiedSidebarItems;

// Helper function to get role display name
export const getRoleDisplayName = (role: number | string | { id: string; name: string }) => {
    // Normalize role to string or number
    let roleValue: string | number;
    if (typeof role === 'object' && role !== null && 'name' in role) {
        roleValue = role.name.toLowerCase();
    } else if (typeof role === 'string') {
        roleValue = role.toLowerCase();
    } else {
        roleValue = role;
    }

    switch (roleValue) {
        case 1:
        case 'superadmin': return "Super Admin";
        case 2:
        case 'admin': return "Admin";
        case 3:
        case 'teacher': return "Teacher";
        case 4:
        case 'student': return "Student";
        case 5:
        case 'parent': return "Parent";
        default: return "User";
    }
};
