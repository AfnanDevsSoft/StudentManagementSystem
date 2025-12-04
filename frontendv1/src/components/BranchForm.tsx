"use client";

import React, { useState } from "react";
import { Save, X } from "lucide-react";

export interface BranchFormData {
  id?: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state_province: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website?: string;
  principal_name: string;
  principal_email: string;
  timezone: string;
  currency: string;
  is_active: boolean;
}

interface BranchFormProps {
  initialData?: BranchFormData;
  onSubmit: (data: BranchFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BranchForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: BranchFormProps) {
  const [formData, setFormData] = useState<BranchFormData>(
    initialData || {
      name: "",
      code: "",
      address: "",
      city: "",
      state_province: "",
      country: "",
      postal_code: "",
      phone: "",
      email: "",
      website: "",
      principal_name: "",
      principal_email: "",
      timezone: "UTC",
      currency: "USD",
      is_active: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Helper function to safely trim values - handles undefined/null
    const getValue = (value: string | undefined | null): string =>
      (value || "").toString();

    if (!getValue(formData.name).trim())
      newErrors.name = "Branch name is required";
    if (!getValue(formData.code).trim())
      newErrors.code = "Branch code is required";
    if (!getValue(formData.address).trim())
      newErrors.address = "Address is required";
    if (!getValue(formData.city).trim()) newErrors.city = "City is required";
    if (!getValue(formData.state_province).trim())
      newErrors.state_province = "State/Province is required";
    if (!getValue(formData.country).trim())
      newErrors.country = "Country is required";
    if (!getValue(formData.postal_code).trim())
      newErrors.postal_code = "Postal code is required";
    if (!getValue(formData.phone).trim()) newErrors.phone = "Phone is required";

    const emailValue = getValue(formData.email);
    if (!emailValue.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      newErrors.email = "Invalid email format";
    }

    if (!getValue(formData.principal_name).trim())
      newErrors.principal_name = "Principal name is required";

    const principalEmailValue = getValue(formData.principal_email);
    if (!principalEmailValue.trim()) {
      newErrors.principal_email = "Principal email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(principalEmailValue)) {
      newErrors.principal_email = "Invalid email format";
    }

    if (!getValue(formData.timezone).trim())
      newErrors.timezone = "Timezone is required";
    if (!getValue(formData.currency).trim())
      newErrors.currency = "Currency is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[70vh] overflow-y-auto pr-4"
    >
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Main Campus"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., BR001"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.code ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Address Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              rows={2}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province *
              </label>
              <input
                type="text"
                name="state_province"
                value={formData.state_province}
                onChange={handleChange}
                placeholder="State or Province"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.state_province ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.state_province && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.state_province}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.country ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="Postal code"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.postal_code ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.postal_code && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.postal_code}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="branch@school.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website || ""}
              onChange={handleChange}
              placeholder="https://branch.school.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Principal Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Principal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Principal Name *
            </label>
            <input
              type="text"
              name="principal_name"
              value={formData.principal_name}
              onChange={handleChange}
              placeholder="Full name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.principal_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.principal_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.principal_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Principal Email *
            </label>
            <input
              type="email"
              name="principal_email"
              value={formData.principal_email}
              onChange={handleChange}
              placeholder="principal@school.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.principal_email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.principal_email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.principal_email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone *
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.timezone ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="CST">CST (Central Standard Time)</option>
              <option value="MST">MST (Mountain Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
              <option value="GMT">GMT (Greenwich Mean Time)</option>
              <option value="IST">IST (Indian Standard Time)</option>
            </select>
            {errors.timezone && (
              <p className="text-red-500 text-sm mt-1">{errors.timezone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency *
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.currency ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="PKR">PKR (Rs)</option>
              <option value="INR">INR (₹)</option>
            </select>
            {errors.currency && (
              <p className="text-red-500 text-sm mt-1">{errors.currency}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Mark branch as active
            </span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-6 border-t sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save Branch"}
        </button>
      </div>
    </form>
  );
}
