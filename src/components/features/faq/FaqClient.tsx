"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: "Viewings & Applications",
    question: "How do viewing requests work?",
    answer:
      "When viewing a property or individual room, click 'Request Viewing' to select your preferred date and time. The property owner will review your request and either confirm or propose another slot. You will receive an instant notification when your viewing is confirmed.",
  },
  {
    category: "Viewings & Applications",
    question: "What happens after I submit a rental application?",
    answer:
      "Property owners review incoming applications along with your intended move-in date. Once an owner approves your application, an active Tenancy record is created and an initial Deposit invoice is automatically generated.",
  },
  {
    category: "Viewings & Applications",
    question: "Can I cancel a viewing or withdraw an application?",
    answer:
      "You can withdraw any pending rental application directly from your Tenant Dashboard under 'Applications'. Once approved, the lease becomes active and can only be ended via the Tenancies tab.",
  },
  {
    category: "Tenancies & Roommates",
    question: "How are individual rooms and DoorPlates assigned?",
    answer:
      "Every property on Nestly assigns specific DoorPlate room numbers (e.g. Room A-101) to each unit. Your tenancy agreement is tied directly to your specific DoorPlate identifier and room capacity.",
  },
  {
    category: "Tenancies & Roommates",
    question: "How does roommate lifestyle matching work?",
    answer:
      "In your Roommates dashboard, you can define your budget range, preferred area, sleep schedule (early riser vs night owl), noise tolerance, and lifestyle tags. Our algorithm matches you with prospective housemates and highlights compatible rooms.",
  },
  {
    category: "Billing & Stripe Payments",
    question: "How are rent and security deposits paid?",
    answer:
      "Nestly integrates with Stripe Checkout. In your Invoices dashboard, click 'Pay with Stripe' to complete the secure hosted checkout. In test mode, you can use the test card 4242 4242 4242 4242 to test the instant confirmation flow.",
  },
  {
    category: "Billing & Stripe Payments",
    question: "How are utility bills split among roommates?",
    answer:
      "Property hosts can generate UTILITY invoices with a single total amount, which is automatically calculated and divided equally among all active tenants currently living in that property.",
  },
  {
    category: "Maintenance & Support",
    question: "How do I submit a maintenance or repair ticket?",
    answer:
      "Tenants with an active tenancy can navigate to 'Maintenance' in their dashboard, click 'New Request', provide a title, description, priority level (Low, Medium, High, Urgent), and upload up to 4 photos. Property hosts manage tickets through a Kanban board.",
  },
  {
    category: "Maintenance & Support",
    question: "How do I end my tenancy?",
    answer:
      "Tenants can request to end an active tenancy from the tenancy detail page. Once confirmed, the status updates to TERMINATED and room capacity is automatically restored for future residents.",
  },
];

export function FaqClient() {
  const [openIndices, setOpenIndices] = React.useState<number[]>([0]);
  const [activeCategory, setActiveCategory] = React.useState<string>("ALL");

  const categories = ["ALL", ...Array.from(new Set(FAQS.map((f) => f.category)))];

  const filteredFaqs =
    activeCategory === "ALL"
      ? FAQS
      : FAQS.filter((f) => f.category === activeCategory);

  const toggleFaq = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-20 bg-muted/30 border-b border-border/50 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-4">
          <Badge variant="outline" className="text-xs font-medium text-primary border-primary/20">
            Knowledge Base
          </Badge>
          <h1 className="h1-display font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Everything you need to know about viewings, leases, roommate compatibility, Stripe payments, and maintenance requests.
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat === "ALL" ? "All Questions" : cat}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-4 pt-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndices.includes(idx);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-colors shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 flex items-center justify-between text-left font-display font-semibold text-sm sm:text-base hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3 bg-muted/10">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Direct Support Card */}
          <div className="p-8 rounded-2xl bg-muted/40 border border-border text-center space-y-4 mt-12">
            <HelpCircle className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-display font-bold text-lg">Still have questions?</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Our residential support team is available to assist with room tours, leasing terms, or owner inquiries.
            </p>
            <Link href="/contact" className={buttonVariants({ variant: "default", size: "sm" })}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
