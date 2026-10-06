import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/api/auth";
import { AuthError } from "@/api/client";
import type { User } from "@/types/user";

/** The logged-in user, or null while checking. Sends visitors who aren't logged in to the login page. */
export function useCurrentUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    fetchMe().then(setUser, (e: Error) => (e instanceof AuthError ? router.replace("/") : setError(e.message)));
  }, [router, attempt]);

  const retry = () => {
    setError("");
    setAttempt((a) => a + 1);
  };

  return { user, error, retry };
}
