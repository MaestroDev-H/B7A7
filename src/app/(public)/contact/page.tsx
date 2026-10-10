"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, MapPin, MessageSquare, Send, Loader2, Sparkles, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true);

    if (!web3formsKey) {
      // Fallback: trigger mailto link directly
      const mailtoUrl = `mailto:support@nestlyliving.com?subject=${encodeURIComponent(
        values.subject
      )}&body=${encodeURIComponent(
        `Name: ${values.name}\nEmail: ${values.email}\n\nMessage:\n${values.message}`
      )}`;
      window.location.assign(mailtoUrl);
      toast.success("Opening your email client to send message...");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: web3formsKey,
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Message sent! Our support team will get back to you shortly.");
        form.reset();
      } else {
        toast.error(result.message || "Failed to submit message");
      }
    } catch {
      toast.error("Could not send message. Please reach us at support@nestlyliving.com");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-20 bg-muted/30 border-b border-border/50 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-4">
          <Badge variant="outline" className="text-xs font-medium text-primary border-primary/20">
            Get in Touch
          </Badge>
          <h1 className="h1-display font-bold text-foreground">Contact Our Team</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Have questions about room reservations, listing a property, or technical support? Send us a message and we will respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl text-foreground">
                  Direct Inquiries
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Reach out for resident support, partnership opportunities, or billing assistance.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3 shadow-2xs">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">Email Us</h4>
                    <a
                      href="mailto:support@nestlyliving.com"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                    >
                      support@nestlyliving.com
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3 shadow-2xs">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">Headquarters</h4>
                    <p className="text-xs text-muted-foreground">
                      500 Howard Street, Suite 400<br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3 shadow-2xs">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">Support Hours</h4>
                    <p className="text-xs text-muted-foreground">
                      Monday &ndash; Friday: 9:00 AM &ndash; 6:00 PM PST<br />
                      Weekend emergency maintenance tickets monitored 24/7.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-md">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">
                Send a Message
              </h3>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" disabled={isSubmitting} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="jane@example.com"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Viewing request inquiry"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us how we can assist you..."
                            rows={5}
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full font-medium" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
