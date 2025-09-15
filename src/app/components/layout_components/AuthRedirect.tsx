"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface CustomUser {
  username: string;
  groups: string[];
  userPoolId?: string;
  customAttributes: {
    email: string;
    email_verified?: string;
    "custom:users_role": string;
    sub?: string;
  };
}

interface AuthRedirectProps {
  authLoading: boolean;
  pathname: string;
  user: CustomUser | null;
  showLoader: () => void;
  hideLoader: () => void;
  setContentReady: (ready: boolean) => void;
}

type UserInput = {
  username: string;
  email: string;
  role: string;
};

export default function AuthRedirect({
  authLoading,
  pathname,
  user,
  showLoader,
  hideLoader,
  setContentReady,
}: AuthRedirectProps) {
  const router = useRouter();
  const didStart = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    let isCancelled = false;
    const groups = user?.groups || [];
    const role = user?.customAttributes?.["custom:users_role"];
    const isSuperAdmin = role === "Super Admin";
    const isAdminRoute = pathname.startsWith("/super_admin_portal");

    // Start loader
    if (!didStart.current) {
      showLoader();
      didStart.current = true;
    }

    // Hide loader immediately once ready
    if (didStart.current) {
      hideLoader();
      didStart.current = true;
    }

    // Not logged in → redirect to login
    if (!user && pathname !== "/") {
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;
      return;
    }

    // Block non-super admins from super_admin_portal
    if (isAdminRoute && !isSuperAdmin) {
      router.replace("/404");
      return;
    }

    const onlyOneGroup = groups.length === 1 && groups[0] !== "*";

    async function fetchTenants() {
      try {
        const userInput: UserInput = {
          username: user!.username,
          email: user!.customAttributes.email,
          role: user!.customAttributes["custom:users_role"],
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            query: `
              query GetTenantsBySchemas($user: UserInput!) {
                tenantsBySchemas(user: $user) {
                  schema
                  tenant_name
                  tenant_status
                }
              }
            `,
            variables: { user: userInput },
          }),
        });

        const json = await res.json();
        const tenant_id = json.data?.tenantsBySchemas?.[0]?.schema;

        if (tenant_id) {
          // Save tenant in cookie (45 mins)
          const maxAgeDays = 45 / (24 * 60); // 45 minutes in days
          Cookies.set("tenant", tenant_id, {
            path: "/",
            sameSite: "lax",
            expires: maxAgeDays,
          });

          // Redirect if user is on /tenants
          if (pathname === "/tenants") {
            router.replace("/dashboard");
          }
        } else {
          console.error("No tenants found for user.");
        }
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    }

    // If user has only one group, fetch tenants and redirect if needed
    if (onlyOneGroup && pathname !== "/dashboard") {
      fetchTenants();
    }

    // Mark content ready after a short delay
    const timer = setTimeout(() => {
      if (!isCancelled) {
        setContentReady(true);
        hideLoader();
        didStart.current = false;
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      isCancelled = true;
    };
  }, [
    authLoading,
    pathname,
    user,
    router,
    showLoader,
    hideLoader,
    setContentReady,
  ]);

  return null;
}
