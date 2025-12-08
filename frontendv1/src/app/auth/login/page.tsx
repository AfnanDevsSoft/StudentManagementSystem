"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import { AlertCircle, Loader } from "lucide-react";
import { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [username, setUsername] = useState("admin1");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.login(username, password);

      if (response.success) {
        // Backend returns token and user at top level (not nested in data)
        const token = response.token || response.data?.access_token || response.access_token;
        const backendUser = (response.user || response.data?.user || response.data) as any;

        if (!token) {
          console.error("Token missing from response:", response);
          setError("No token received from server");
          setIsLoading(false);
          return;
        }

        // Check if we have user data
        if (!backendUser || !backendUser.id) {
          console.error("Invalid response structure:", response);
          setError("Invalid user data received from server");
          setIsLoading(false);
          return;
        }

        // Transform backend user data to match User interface
        const userData = {
          id: backendUser.id,
          username: backendUser.username,
          email: backendUser.email,
          first_name: backendUser.firstName || backendUser.first_name || "",
          last_name: backendUser.lastName || backendUser.last_name || "",
          role:
            typeof backendUser.role === "string"
              ? (backendUser.role as UserRole)
              : (backendUser.role?.name as UserRole) || "SuperAdmin",
          branch_id: backendUser.branch_id || "",
          branch_name: backendUser.branch_name || "",
          permissions: backendUser.permissions || [],
          profile_photo_url: backendUser.profile_photo_url,
          created_at: backendUser.created_at,
        };

        // Store with consistent key names that apiClient expects
        localStorage.setItem("access_token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update Zustand store
        setUser(userData);
        setToken(token);

        // Redirect to unified dashboard (role-based content is handled there)
        router.push("/dashboard");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">SM</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Student Management
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Sign in to your account
          </p>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
            >
              {isLoading && <Loader size={20} className="animate-spin" />}
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-blue-800">
              Username: <span className="font-mono">admin1</span>
            </p>
            <p className="text-xs text-blue-800">
              Password: <span className="font-mono">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
