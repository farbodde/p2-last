import AuthGuard from "@/components/common/Auth/AuthGuard";
import BookmarksView from "@/components/features/Bookmarks";
import { Suspense } from "react";

export default function BookmarksPage() {
  return (
    <AuthGuard mode="protected" redirectTo="/auth">
      <Suspense fallback={null}>
        <BookmarksView />
      </Suspense>
    </AuthGuard>
  );
}
