"use client";

import { useEffect, useState } from "react";
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
    <form
      method="POST"
      action={`/api/admin-session/${slug}`}
      className="fixed top-4 right-4 z-50"
    >
      <input type="hidden" name="token" value={adminToken} />
      <Button
        type="submit"
        size="sm"
        className="bg-neighbor-orange hover:bg-neighbor-orange/90 text-white shadow-lg"
      >
        Modifier l&apos;événement
      </Button>
    </form>
  );
}
