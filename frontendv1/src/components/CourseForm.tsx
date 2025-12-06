"use client";

import React, { useState, useEffect } from "react";

export interface CourseFormData {
    id?: string;
    branch_id: string;
    course_code: string;
    course_name: string;
    description: string;
    academic_year_id: string;
    grade_level_id?: string;
    teacher_id?: string;
    max_students?: number;
    room_number?: string;
    schedule?: string;
    credits?: number;
}

interface CourseFormProps {
    initialData?: Partial<CourseFormData>;
    onSubmit: (data: CourseFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    teachers?: any[];
}

export default function CourseForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    teachers = [],
}: CourseFormProps) {
    const [formData, setFormData] = useState<CourseFormData>({
        id: initialData?.id,
        branch_id: initialData?.branch_id || "",
        course_code: initialData?.course_code || "",
        course_name: initialData?.course_name || "",
        description: initialData?.description || "",
        academic_year_id: initialData?.academic_year_id || "default",
        grade_level_id: initialData?.grade_level_id,
        teacher_id: initialData?.teacher_id,
        max_students: initialData?.max_students || 30,
        room_number: initialData?.room_number || "",
        schedule: initialData?.schedule || "",
        credits: initialData?.credits || 3,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.course_code.trim()) newErrors.course_code = "Course code is required";
        if (!formData.course_name.trim()) newErrors.course_name = "Course name is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";

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
                        Course Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="course_code"
                        value={formData.course_code}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.course_code ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="CS101"
                    />
                    {errors.course_code && (
                        <p className="text-red-500 text-xs mt-1">{errors.course_code}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="course_name"
                        value={formData.course_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.course_name ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Introduction to Computer Science"
                    />
                    {errors.course_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.course_name}</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.description ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Course description..."
                    />
                    {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teacher
                    </label>
                    <select
                        name="teacher_id"
                        value={formData.teacher_id || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Select Teacher</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.first_name} {teacher.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade Level
                    </label>
                    <select
                        name="grade_level_id"
                        value={formData.grade_level_id || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Select Grade</option>
                        <option value="9">Grade 9</option>
                        <option value="10">Grade 10</option>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Students
                    </label>
                    <input
                        type="number"
                        name="max_students"
                        value={formData.max_students}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="1"
                        max="100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credits
                    </label>
                    <input
                        type="number"
                        name="credits"
                        value={formData.credits}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="1"
                        max="6"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                    </label>
                    <input
                        type="text"
                        name="room_number"
                        value={formData.room_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Room 101"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule
                    </label>
                    <input
                        type="text"
                        name="schedule"
                        value={formData.schedule}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Mon-Wed-Fri 9:00-10:00"
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
                    {isLoading ? "Saving..." : initialData?.id ? "Update Course" : "Create Course"}
                </button>
            </div>
        </form>
    );
}
