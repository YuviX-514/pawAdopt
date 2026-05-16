import { Suspense } from "react";
import LoadingState from "@/components/ui/LoadingState";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState label="Searching pets..." />}>
      <SearchClient />
    </Suspense>
  );
}
