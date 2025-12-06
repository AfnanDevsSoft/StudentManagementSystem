"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/apiClient";
import { Library as LibraryIcon, Plus, Search, BookOpen, X } from "lucide-react";

interface Book {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    category?: string;
    total_copies: number;
    available_copies: number;
    publisher?: string;
}

export default function LibraryPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [branchId, setBranchId] = useState("");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);
            setBranchId(userData.branch_id);
            if (userData.branch_id) {
                fetchBooks(userData.branch_id);
            }
        }
    }, []);

    const fetchBooks = async (branchId: string, filters = {}) => {
        try {
            const response = await apiClient.getBooks(branchId, filters);
            if (response.data.success) {
                setBooks(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    };

    const handleSearch = () => {
        const filters: any = {};
        if (searchTerm) filters.title = searchTerm;
        if (category) filters.category = category;
        fetchBooks(branchId, filters);
    };

    const handleAddBook = async (data: Partial<Book>) => {
        setLoading(true);
        try {
            const response = await apiClient.createBook({
                ...data,
                branch_id: branchId,
            });
            if (response.data.success) {
                toast.success("Book added successfully!");
                fetchBooks(branchId);
                setShowAddModal(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add book");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage books, track loans, and view borrowing history
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Book
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white border-b p-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="">All Categories</option>
                        <option value="fiction">Fiction</option>
                        <option value="non-fiction">Non-Fiction</option>
                        <option value="textbook">Textbook</option>
                        <option value="reference">Reference</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Books Grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {books.map((book) => (
                        <div key={book.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-16 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="text-blue-600" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                                    <p className="text-xs text-gray-600 mt-1">{book.author}</p>
                                    {book.category && (
                                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            {book.category}
                                        </span>
                                    )}
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Available</span>
                                            <span className={`font-semibold ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {book.available_copies} / {book.total_copies}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium">
                                Issue Book
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Book Modal */}
            {showAddModal && (
                <AddBookModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddBook}
                    loading={loading}
                />
            )}
        </div>
    );
}

function AddBookModal({
    onClose,
    onSubmit,
    loading,
}: {
    onClose: () => void;
    onSubmit: (data: Partial<Book>) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        isbn: "",
        publisher: "",
        category: "textbook",
        total_copies: 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New Book</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Author *</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">ISBN</label>
                                <input
                                    type="text"
                                    value={formData.isbn}
                                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Copies *</label>
                                <input
                                    type="number"
                                    value={formData.total_copies}
                                    onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="fiction">Fiction</option>
                                <option value="non-fiction">Non-Fiction</option>
                                <option value="textbook">Textbook</option>
                                <option value="reference">Reference</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Adding..." : "Add Book"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
