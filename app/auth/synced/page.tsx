"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { writeWebSessionHint } from "../../web-session-hint";

function SyncedInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const signedIn = searchParams.get("signedIn") === "1";
    const name = searchParams.get("name");

    writeWebSessionHint({
      signedIn,
      name: signedIn && name ? name : null,
    });

    router.replace("/");
  }, [router, searchParams]);

  return (
    <p className="px-5 py-10 text-center text-sm text-muted">
      Updating session...
    </p>
  );
}

/** Receives the portal redirect and stores a local session hint for the header. */
export default function SyncedPage() {
  return (
    <Suspense
      fallback={
        <p className="px-5 py-10 text-center text-sm text-muted">
          Updating session...
        </p>
      }
    >
      <SyncedInner />
    </Suspense>
  );
}
