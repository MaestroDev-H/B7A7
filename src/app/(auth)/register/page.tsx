import type { Metadata } from "next";
import { RegisterForm } from "@/components/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Join Nestly to find verified rooms, compatible roommates, or list your properties.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
