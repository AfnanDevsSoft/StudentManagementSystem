"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    Download,
    FileText,
    Table,
    Calendar,
    SlidersHorizontal,
} from "lucide-react";

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    id: string;
    label: string;
    type: "select" | "multiselect" | "date" | "daterange" | "number" | "text";
    options?: FilterOption[];
    placeholder?: string;
}

interface AdvancedSearchProps {
    searchPlaceholder?: string;
    filters: FilterConfig[];
    onSearch: (searchTerm: string) => void;
    onFilterChange: (filters: Record<string, any>) => void;
    onExport?: (format: "csv" | "excel" | "pdf") => void;
    className?: string;
    showExport?: boolean;
}

export default function AdvancedSearch({
    searchPlaceholder = "Search...",
    filters,
    onSearch,
    onFilterChange,
    onExport,
    className = "",
    showExport = true,
}: AdvancedSearchProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filterValues, setFilterValues] = useState<Record<string, any>>({});
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // Notify parent when filters change
    useEffect(() => {
        onFilterChange(filterValues);
    }, [filterValues, onFilterChange]);

    const handleFilterChange = (filterId: string, value: any) => {
        setFilterValues(prev => ({
            ...prev,
            [filterId]: value,
        }));
    };

    const clearFilter = (filterId: string) => {
        setFilterValues(prev => {
            const next = { ...prev };
            delete next[filterId];
            return next;
        });
    };

    const clearAllFilters = () => {
        setFilterValues({});
        setSearchTerm("");
    };

    const activeFilterCount = Object.keys(filterValues).filter(
        key => filterValues[key] !== undefined && filterValues[key] !== ""
    ).length;

    const handleExport = (format: "csv" | "excel" | "pdf") => {
        if (onExport) {
            onExport(format);
        }
        setShowExportMenu(false);
    };

    const renderFilterInput = (filter: FilterConfig) => {
        const value = filterValues[filter.id] || "";

        switch (filter.type) {
            case "select":
                return (
                    <select
                        value={value}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="">{filter.placeholder || `Select ${filter.label}`}</option>
                        {filter.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );

            case "multiselect":
                const selectedValues = (value as string[]) || [];
                return (
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                            {selectedValues.map((val) => {
                                const opt = filter.options?.find(o => o.value === val);
                                return (
                                    <span
                                        key={val}
                                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                    >
                                        {opt?.label || val}
                                        <button
                                            onClick={() => handleFilterChange(
                                                filter.id,
                                                selectedValues.filter(v => v !== val)
                                            )}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                        <select
                            value=""
                            onChange={(e) => {
                                if (e.target.value && !selectedValues.includes(e.target.value)) {
                                    handleFilterChange(filter.id, [...selectedValues, e.target.value]);
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="">{filter.placeholder || `Add ${filter.label}`}</option>
                            {filter.options
                                ?.filter(opt => !selectedValues.includes(opt.value))
                                .map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                        </select>
                    </div>
                );

            case "date":
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                );

            case "daterange":
                const dateRange = value || { from: "", to: "" };
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={dateRange.from || ""}
                            onChange={(e) => handleFilterChange(filter.id, { ...dateRange, from: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="From"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="date"
                            value={dateRange.to || ""}
                            onChange={(e) => handleFilterChange(filter.id, { ...dateRange, to: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="To"
                        />
                    </div>
                );

            case "number":
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        placeholder={filter.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                );

            case "text":
            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        placeholder={filter.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                );
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Search Bar Row */}
            <div className="flex items-center space-x-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg transition ${showFilters || activeFilterCount > 0
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <SlidersHorizontal size={18} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                            {activeFilterCount}
                        </span>
                    )}
                    {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Export Button */}
                {showExport && onExport && (
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            <Download size={18} />
                            <span>Export</span>
                            <ChevronDown size={16} />
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                                <button
                                    onClick={() => handleExport("csv")}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <Table size={16} />
                                    <span>CSV</span>
                                </button>
                                <button
                                    onClick={() => handleExport("excel")}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <FileText size={16} />
                                    <span>Excel</span>
                                </button>
                                <button
                                    onClick={() => handleExport("pdf")}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <FileText size={16} />
                                    <span>PDF</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Advanced Filters</h4>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filters.map((filter) => (
                            <div key={filter.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {filter.label}
                                    {filterValues[filter.id] && (
                                        <button
                                            onClick={() => clearFilter(filter.id)}
                                            className="ml-2 text-gray-400 hover:text-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </label>
                                {renderFilterInput(filter)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && !showFilters && (
                <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {Object.entries(filterValues).map(([key, value]) => {
                        if (!value || (Array.isArray(value) && value.length === 0)) return null;
                        const filter = filters.find(f => f.id === key);
                        let displayValue = value;

                        if (filter?.type === "select" && filter.options) {
                            displayValue = filter.options.find(o => o.value === value)?.label || value;
                        } else if (filter?.type === "multiselect" && Array.isArray(value)) {
                            displayValue = `${value.length} selected`;
                        } else if (filter?.type === "daterange" && typeof value === "object") {
                            displayValue = `${value.from || "..."} - ${value.to || "..."}`;
                        }

                        return (
                            <span
                                key={key}
                                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                                {filter?.label}: {String(displayValue)}
                                <button
                                    onClick={() => clearFilter(key)}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Export filter configs for common use cases
export const studentFilterConfig: FilterConfig[] = [
    {
        id: "grade",
        label: "Grade Level",
        type: "select",
        options: [
            { label: "Grade 1", value: "1" },
            { label: "Grade 2", value: "2" },
            { label: "Grade 3", value: "3" },
            { label: "Grade 4", value: "4" },
            { label: "Grade 5", value: "5" },
            { label: "Grade 6", value: "6" },
            { label: "Grade 7", value: "7" },
            { label: "Grade 8", value: "8" },
            { label: "Grade 9", value: "9" },
            { label: "Grade 10", value: "10" },
        ],
    },
    {
        id: "status",
        label: "Status",
        type: "select",
        options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Graduated", value: "graduated" },
            { label: "Transferred", value: "transferred" },
        ],
    },
    {
        id: "gender",
        label: "Gender",
        type: "select",
        options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
        ],
    },
    {
        id: "enrollmentDate",
        label: "Enrollment Date",
        type: "daterange",
    },
];

export const teacherFilterConfig: FilterConfig[] = [
    {
        id: "department",
        label: "Department",
        type: "select",
        options: [
            { label: "Science", value: "science" },
            { label: "Mathematics", value: "mathematics" },
            { label: "English", value: "english" },
            { label: "Social Studies", value: "social_studies" },
            { label: "Arts", value: "arts" },
            { label: "Physical Education", value: "pe" },
        ],
    },
    {
        id: "status",
        label: "Status",
        type: "select",
        options: [
            { label: "Active", value: "active" },
            { label: "On Leave", value: "on_leave" },
            { label: "Resigned", value: "resigned" },
        ],
    },
    {
        id: "experience",
        label: "Experience (Years)",
        type: "number",
        placeholder: "Min years",
    },
];

export const feeFilterConfig: FilterConfig[] = [
    {
        id: "status",
        label: "Payment Status",
        type: "select",
        options: [
            { label: "Paid", value: "paid" },
            { label: "Pending", value: "pending" },
            { label: "Overdue", value: "overdue" },
            { label: "Partial", value: "partial" },
        ],
    },
    {
        id: "feeType",
        label: "Fee Type",
        type: "select",
        options: [
            { label: "Tuition", value: "tuition" },
            { label: "Admission", value: "admission" },
            { label: "Transport", value: "transport" },
            { label: "Lab", value: "lab" },
            { label: "Library", value: "library" },
        ],
    },
    {
        id: "dateRange",
        label: "Due Date Range",
        type: "daterange",
    },
    {
        id: "amountMin",
        label: "Min Amount (PKR)",
        type: "number",
        placeholder: "Min amount",
    },
];
