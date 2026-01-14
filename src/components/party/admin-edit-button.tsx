"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminToken } from "@/lib/storage/admin-parties";
import { Button } from "@/components/ui/button";

interface AdminEditButtonProps {
  slug: string;
}

export function AdminEditButton({ slug }: AdminEditButtonProps) {
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    setAdminToken(getAdminToken(slug));
  }, [slug]);

  if (!adminToken) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        asChild
        size="sm"
        className="bg-neighbor-orange hover:bg-neighbor-orange/90 text-white shadow-lg"
      >
        <Link href={`/${slug}/admin?token=${adminToken}`}>
          Modifier l&apos;événement
        </Link>
      </Button>
    </div>
  );
}
