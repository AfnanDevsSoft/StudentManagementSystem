"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";
import BranchForm, { BranchFormData } from "@/components/BranchForm";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { apiClient } from "@/lib/apiClient";
import { superadminSidebarItems } from "@/config/sidebarConfig";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Building,
} from "lucide-react";
import { Branch } from "@/types";
import toast from "react-hot-toast";

export default function BranchesList() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Define fetchBranches first so it can be used in useEffect
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBranches(
        pagination.page,
        pagination.limit,
        searchTerm
      );
      if (response.success) {
        setBranches(Array.isArray(response.data) ? response.data : []);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.pagination?.total || 0,
          }));
        }
      } else {
        toast.error(response.message || "Failed to load branches");
      }
    } catch (error: unknown) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches when page or search changes
  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, searchTerm]);

  const convertToBranchFormData = (branch: Branch): BranchFormData => {
    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      address: branch.address,
      city: branch.city,
      state_province: branch.state, // Map backend 'state' to form 'state_province'
      country: branch.country,
      postal_code: branch.postal_code,
      phone: branch.phone,
      email: branch.email,
      website: branch.website,
      principal_name: branch.principal_name,
      principal_email: branch.principal_email,
      timezone: branch.timezone,
      currency: branch.currency,
      is_active: branch.is_active,
    };
  };

  const handleAddBranch = async (formData: BranchFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.createBranch(formData);
      if (response.success) {
        toast.success("Branch created successfully");
        setShowAddModal(false);
        await fetchBranches();
      } else {
        toast.error(response.message || "Failed to create branch");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error creating branch:", error);
      const errorMessage =
        err.response?.data?.message || "Failed to create branch";
      // Extract more user-friendly error messages
      let displayMessage = errorMessage;
      if (
        errorMessage.includes("Unique constraint failed") &&
        errorMessage.includes("code")
      ) {
        displayMessage =
          "A branch with this code already exists. Please use a different code.";
      }
      toast.error(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBranch = async (formData: BranchFormData) => {
    if (!selectedBranch) return;
    setIsLoading(true);
    try {
      const response = await apiClient.updateBranch(
        selectedBranch.id,
        formData
      );
      if (response.success) {
        toast.success("Branch updated successfully");
        setShowEditModal(false);
        setSelectedBranch(null);
        await fetchBranches();
      } else {
        toast.error(response.message || "Failed to update branch");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error updating branch:", error);
      const errorMessage =
        err.response?.data?.message || "Failed to update branch";
      // Extract more user-friendly error messages
      let displayMessage = errorMessage;
      if (
        errorMessage.includes("Unique constraint failed") &&
        errorMessage.includes("code")
      ) {
        displayMessage =
          "A branch with this code already exists. Please use a different code.";
      }
      toast.error(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;
    setIsLoading(true);
    try {
      const response = await apiClient.deleteBranch(selectedBranch.id);
      if (response.success) {
        toast.success("Branch deleted successfully");
        setShowDeleteModal(false);
        setSelectedBranch(null);
        await fetchBranches();
      } else {
        toast.error(response.message || "Failed to delete branch");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error deleting branch:", error);
      toast.error(err.response?.data?.message || "Failed to delete branch");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowEditModal(true);
  };

  const openDeleteModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on search
  };


  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Branches Management" sidebarItems={superadminSidebarItems}>
        <div className="space-y-6">
          {/* Header with Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Branches</p>
              <p className="text-3xl font-bold mt-2 text-blue-600">
                {pagination.total}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-3xl font-bold mt-2 text-green-600">
                {branches.filter((b) => b.is_active).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Inactive</p>
              <p className="text-3xl font-bold mt-2 text-red-600">
                {branches.filter((b) => !b.is_active).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Current Page</p>
              <p className="text-3xl font-bold mt-2 text-purple-600">
                {pagination.page} / {totalPages || 1}
              </p>
            </div>
          </div>

          {/* Search and Add Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, code, or city..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <Plus size={20} />
                Add Branch
              </button>
            </div>
          </div>

          {/* Branches Grid */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading branches...</p>
            </div>
          ) : branches.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg shadow">
              <Building className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No branches found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branches.map((branch: Branch) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {branch.name}
                      </h3>
                      <p className="text-sm text-gray-500">{branch.code}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${branch.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {branch.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <p>
                      <strong>Address:</strong> {branch.address}
                    </p>
                    <p>
                      <strong>City:</strong> {branch.city}, {branch.state}
                    </p>
                    <p>
                      <strong>Country:</strong> {branch.country}
                    </p>
                    <p>
                      <strong>Principal:</strong> {branch.principal_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {branch.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {branch.phone}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button
                      onClick={() => openEditModal(branch)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(branch)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setPagination((prev) => ({ ...prev, page }))}
                    className={`px-4 py-2 rounded-lg ${pagination.page === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(totalPages, prev.page + 1),
                  }))
                }
                disabled={pagination.page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Add Branch Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Branch"
          size="lg"
        >
          <BranchForm
            onSubmit={handleAddBranch}
            onCancel={() => setShowAddModal(false)}
            isLoading={isLoading}
          />
        </Modal>

        {/* Edit Branch Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBranch(null);
          }}
          title="Edit Branch"
          size="lg"
        >
          {selectedBranch && (
            <BranchForm
              initialData={convertToBranchFormData(selectedBranch)}
              onSubmit={handleEditBranch}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedBranch(null);
              }}
              isLoading={isLoading}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedBranch(null);
          }}
          onConfirm={handleDeleteBranch}
          title="Delete Branch"
          message="Are you sure you want to delete this branch? This action cannot be undone and all related data may be affected."
          itemName={selectedBranch ? selectedBranch.name : ""}
          isLoading={isLoading}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
