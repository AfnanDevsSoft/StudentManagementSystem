"use client";

import React, { useState } from "react";

export interface TeacherFormData {
    id?: string;
    branch_id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    nationality: string;
    hire_date: string;
    employment_type: string;
    department: string;
    designation: string;
    qualification_level: string;
    years_of_experience: number;
    salary?: number;
}

interface TeacherFormProps {
    initialData?: Partial<TeacherFormData>;
    onSubmit: (data: TeacherFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function TeacherForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: TeacherFormProps) {
    const [formData, setFormData] = useState<TeacherFormData>({
        id: initialData?.id,
        branch_id: initialData?.branch_id || "",
        employee_code: initialData?.employee_code || "",
        first_name: initialData?.first_name || "",
        last_name: initialData?.last_name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        date_of_birth: initialData?.date_of_birth || "",
        gender: initialData?.gender || "male",
        nationality: initialData?.nationality || "",
        hire_date: initialData?.hire_date || new Date().toISOString().split("T")[0],
        employment_type: initialData?.employment_type || "full_time",
        department: initialData?.department || "",
        designation: initialData?.designation || "",
        qualification_level: initialData?.qualification_level || "bachelors",
        years_of_experience: initialData?.years_of_experience || 0,
        salary: initialData?.salary,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.employee_code.trim()) newErrors.employee_code = "Employee code is required";
        if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
        if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (!formData.department.trim()) newErrors.department = "Department is required";
        if (!formData.designation.trim()) newErrors.designation = "Designation is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="employee_code"
                        value={formData.employee_code}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.employee_code ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="TCH-001"
                    />
                    {errors.employee_code && (
                        <p className="text-red-500 text-xs mt-1">{errors.employee_code}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.first_name ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="First name"
                    />
                    {errors.first_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.last_name ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Last name"
                    />
                    {errors.last_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.email ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="teacher@example.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.phone ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="+92 300 1234567"
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                    </label>
                    <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Pakistani"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hire Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="hire_date"
                        value={formData.hire_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="employment_type"
                        value={formData.employment_type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="visiting">Visiting</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.department ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Mathematics"
                    />
                    {errors.department && (
                        <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.designation ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Senior Lecturer"
                    />
                    {errors.designation && (
                        <p className="text-red-500 text-xs mt-1">{errors.designation}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualification Level <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="qualification_level"
                        value={formData.qualification_level}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="high_school">High School</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">PhD</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                    </label>
                    <input
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="0"
                        placeholder="5"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Salary (PKR)
                    </label>
                    <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="50000"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Saving..." : initialData?.id ? "Update Teacher" : "Create Teacher"}
                </button>
            </div>
        </form>
    );
}
