"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionEmail } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (getSessionEmail()) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return null;
}
