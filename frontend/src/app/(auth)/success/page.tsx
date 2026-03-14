"use client";
import { userAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import Loader from "@/components/Loader";

const SuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = userAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");
    const userStr = searchParams.get("user");

    if (token && type && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        // Add type to user object
        const userData = {
          ...user,
          type: type as "doctor" | "patient",
        };

        // Set user in auth store
        setUser(userData, token);

        // Redirect to appropriate dashboard
        if (userData.isVerified) {
          if (type === "doctor") {
            router.push("/doctor/dashboard");
          } else {
            router.push("/patient/dashboard");
          }
        } else {
          router.push(`/onboarding/${type}`);
        }
      } catch (error) {
        console.error("Failed to parse auth data", error);
        router.push("/auth/login/patient");
      }
    } else {
      router.push("/auth/login/patient");
    }
  }, [searchParams, setUser, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader />
    </div>
  );
};

export default SuccessPage;
