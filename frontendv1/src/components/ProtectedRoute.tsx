"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { getDashboardRoute } from "@/lib/rbac";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (!storedToken || !storedUser) {
      router.push("/auth/login");
      return;
    }

    // Restore auth state
    try {
      const userData = JSON.parse(storedUser);
      useAuthStore.setState({
        user: userData,
        token: storedToken,
        isAuthenticated: true,
      });
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      router.push("/auth/login");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
