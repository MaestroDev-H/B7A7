import type { Metadata } from "next";
import { FaqClient } from "@/components/features/faq/FaqClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Everything you need to know about viewings, leases, roommate compatibility, Stripe payments, and maintenance requests.",
};

export default function FaqPage() {
  return <FaqClient />;
}
