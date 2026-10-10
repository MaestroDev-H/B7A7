import { notFound } from "next/navigation";
import { DevKitClient } from "./DevKitClient";

export default function DevKitPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <DevKitClient />;
}

