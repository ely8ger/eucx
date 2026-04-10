"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Redirect() {
  const router = useRouter();
  useEffect(() => {
    try {
      const token = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? localStorage.getItem("accessToken") ?? "";
      const role = token ? (JSON.parse(atob(token.split(".")[1])).role ?? "") : "";
      if (role === "SELLER") router.replace("/dashboard/seller");
      else if (["ADMIN","COMPLIANCE_OFFICER","SUPER_ADMIN"].includes(role)) router.replace("/admin");
      else router.replace("/dashboard/buyer");
    } catch { router.replace("/dashboard/buyer"); }
  }, [router]);
  return null;
}
