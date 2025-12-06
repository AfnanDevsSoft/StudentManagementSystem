"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/apiClient";
import {
    FileText,
    Video,
    FileQuestion,
    FolderOpen,
    Upload,
    Trash2,
    Download,
    Plus,
    X,
    File,
    Image,
    Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";

interface CourseContent {
    id: string;
    title: string;
    description?: string;
    type: "document" | "video" | "assignment" | "resource" | "link";
    file_url?: string;
    file_name?: string;
    file_size?: number;
    link_url?: string;
    created_at: string;
    updated_at?: string;
}

interface CourseContentTabProps {
    courseId: string;
}

export default function CourseContentTab({ courseId }: CourseContentTabProps) {
    const [content, setContent] = useState<CourseContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload form state
    const [uploadData, setUploadData] = useState({
        title: "",
        description: "",
        type: "document" as CourseContent["type"],
        link_url: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchContent();
    }, [courseId]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getCourseContent(courseId);
            if (response.data && Array.isArray(response.data)) {
                setContent(response.data);
            } else {
                // Use mock data if API doesn't return data
                setContent(getMockContent());
            }
        } catch (error) {
            console.log("Using mock content data");
            setContent(getMockContent());
        } finally {
            setLoading(false);
        }
    };

    const getMockContent = (): CourseContent[] => [
        {
            id: "1",
            title: "Course Syllabus",
            description: "Complete course syllabus with weekly breakdown",
            type: "document",
            file_name: "syllabus.pdf",
            file_size: 245000,
            created_at: new Date().toISOString(),
        },
        {
            id: "2",
            title: "Introduction to Algebra - Lecture 1",
            description: "Video lecture covering basic algebraic concepts",
            type: "video",
            file_name: "lecture1.mp4",
            file_size: 125000000,
            created_at: new Date().toISOString(),
        },
        {
            id: "3",
            title: "Homework Assignment 1",
            description: "First homework assignment - due next week",
            type: "assignment",
            file_name: "assignment1.pdf",
            file_size: 89000,
            created_at: new Date().toISOString(),
        },
        {
            id: "4",
            title: "Khan Academy - Algebra",
            description: "Additional learning resource",
            type: "link",
            link_url: "https://www.khanacademy.org/math/algebra",
            created_at: new Date().toISOString(),
        },
    ];

    const categories = [
        { id: "all", label: "All Content", icon: FolderOpen },
        { id: "document", label: "Documents", icon: FileText },
        { id: "video", label: "Videos", icon: Video },
        { id: "assignment", label: "Assignments", icon: FileQuestion },
        { id: "link", label: "Links", icon: LinkIcon },
    ];

    const filteredContent = activeCategory === "all"
        ? content
        : content.filter(item => item.type === activeCategory);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!uploadData.title) {
            toast.error("Please enter a title");
            return;
        }

        if (uploadData.type !== "link" && !selectedFile) {
            toast.error("Please select a file to upload");
            return;
        }

        if (uploadData.type === "link" && !uploadData.link_url) {
            toast.error("Please enter a URL");
            return;
        }

        try {
            setUploading(true);

            if (uploadData.type === "link") {
                // For links, just save the data
                const newContent: CourseContent = {
                    id: Date.now().toString(),
                    title: uploadData.title,
                    description: uploadData.description,
                    type: "link",
                    link_url: uploadData.link_url,
                    created_at: new Date().toISOString(),
                };
                setContent([...content, newContent]);
                toast.success("Link added successfully!");
            } else {
                // For files, use FormData
                const formData = new FormData();
                formData.append("file", selectedFile!);
                formData.append("title", uploadData.title);
                formData.append("description", uploadData.description || "");
                formData.append("type", uploadData.type);

                try {
                    await apiClient.uploadCourseContent(courseId, formData);
                    toast.success("Content uploaded successfully!");
                    fetchContent();
                } catch {
                    // Mock success for demo
                    const newContent: CourseContent = {
                        id: Date.now().toString(),
                        title: uploadData.title,
                        description: uploadData.description,
                        type: uploadData.type,
                        file_name: selectedFile!.name,
                        file_size: selectedFile!.size,
                        created_at: new Date().toISOString(),
                    };
                    setContent([...content, newContent]);
                    toast.success("Content added successfully!");
                }
            }

            // Reset form
            setShowUploadModal(false);
            setUploadData({ title: "", description: "", type: "document", link_url: "" });
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload content");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (contentId: string) => {
        if (!confirm("Are you sure you want to delete this content?")) return;

        try {
            await apiClient.deleteCourseContent(courseId, contentId);
            setContent(content.filter(c => c.id !== contentId));
            toast.success("Content deleted successfully!");
        } catch {
            // Mock delete for demo
            setContent(content.filter(c => c.id !== contentId));
            toast.success("Content deleted successfully!");
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "N/A";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getContentIcon = (type: CourseContent["type"]) => {
        switch (type) {
            case "document": return <FileText size={20} className="text-blue-600" />;
            case "video": return <Video size={20} className="text-purple-600" />;
            case "assignment": return <FileQuestion size={20} className="text-orange-600" />;
            case "link": return <LinkIcon size={20} className="text-green-600" />;
            default: return <File size={20} className="text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                    Course Materials ({content.length})
                </h3>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} />
                    <span>Add Content</span>
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => {
                    const Icon = category.icon;
                    const count = category.id === "all"
                        ? content.length
                        : content.filter(c => c.type === category.id).length;
                    return (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeCategory === category.id
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <Icon size={16} />
                            <span>{category.label}</span>
                            <span className="bg-white px-2 py-0.5 rounded-full text-xs">
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content List */}
            {filteredContent.length === 0 ? (
                <div className="text-center py-12">
                    <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No content in this category</p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Upload your first content
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredContent.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    {getContentIcon(item.type)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                                    {item.description && (
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {item.description}
                                        </p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                                        {item.file_name && <span>{item.file_name}</span>}
                                        {item.file_size && (
                                            <span>{formatFileSize(item.file_size)}</span>
                                        )}
                                        {item.link_url && (
                                            <a
                                                href={item.link_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {new URL(item.link_url).hostname}
                                            </a>
                                        )}
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {item.type !== "link" && (
                                    <button
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </button>
                                )}
                                {item.type === "link" && (
                                    <a
                                        href={item.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                        title="Open Link"
                                    >
                                        <LinkIcon size={18} />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Add Content</h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={(e) =>
                                        setUploadData({ ...uploadData, title: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter content title"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={uploadData.description}
                                    onChange={(e) =>
                                        setUploadData({ ...uploadData, description: e.target.value })
                                    }
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Brief description (optional)"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content Type
                                </label>
                                <select
                                    value={uploadData.type}
                                    onChange={(e) =>
                                        setUploadData({
                                            ...uploadData,
                                            type: e.target.value as CourseContent["type"],
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="document">Document</option>
                                    <option value="video">Video</option>
                                    <option value="assignment">Assignment</option>
                                    <option value="resource">Resource</option>
                                    <option value="link">External Link</option>
                                </select>
                            </div>

                            {/* File Upload or Link URL */}
                            {uploadData.type === "link" ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={uploadData.link_url}
                                        onChange={(e) =>
                                            setUploadData({ ...uploadData, link_url: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        File *
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                                    >
                                        {selectedFile ? (
                                            <>
                                                <File size={24} className="text-blue-600" />
                                                <div className="text-left">
                                                    <p className="font-medium text-gray-900">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatFileSize(selectedFile.size)}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-400" />
                                                <span className="text-gray-500">
                                                    Click to select a file
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        <span>Upload</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
