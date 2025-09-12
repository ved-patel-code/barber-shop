// src/app/(public)/page.tsx
"use client"; // <-- 1. This is now a client component to use React hooks

import { useState, useEffect } from "react"; // <-- 2. Import hooks
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { siteImages } from "@/lib/images";
import { MapPin, Star } from "lucide-react";

const testimonials = [
  {
    name: "John D.",
    avatar: siteImages.testimonials.avatar1,
    quote:
      "Absolutely the best haircut I've ever had. The attention to detail is unmatched. I walked out feeling like a new man. Highly recommend!",
  },
  {
    name: "Michael S.",
    avatar: siteImages.testimonials.avatar2,
    quote:
      "The atmosphere is so welcoming and professional. My barber listened to exactly what I wanted and delivered perfectly. This is my new go-to spot.",
  },
  {
    name: "David R.",
    avatar: siteImages.testimonials.avatar3,
    quote:
      "A truly premium experience from start to finish. The hot towel shave is a must-try. You can tell they are passionate about their craft.",
  },
];

export default function Home() {
  // 3. Add state to track the vertical scroll position (offset)
  const [offsetY, setOffsetY] = useState(0);

  // This function will be called every time the user scrolls
  const handleScroll = () => {
    setOffsetY(window.scrollY);
  };

  // 4. Use the useEffect hook to add and remove the scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // This is a cleanup function that removes the event listener
    // when the component is no longer on the screen. It's crucial for performance.
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // The empty array ensures this effect only runs once on mount

  return (
    <div className="bg-stone-50">
      {/* Hero Section */}
      {/* 5. Added 'overflow-hidden' to the section to contain the moving image */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center text-center text-white px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <Image
          src={siteImages.hero}
          alt="Modern barber shop interior"
          fill
          className="object-cover z-0"
          priority
          // 6. Apply a transform style to move the image based on scroll offset
          // The image will move up at 50% of the scroll speed.
          style={{
            transform: `translateY(${offsetY * 0.4}px)`,
          }}
        />
        {/* The foreground content (text and buttons) is not transformed, so it scrolls normally */}
        <div className="relative z-20 space-y-6 max-w-xs sm:max-w-2xl lg:max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Style, Precision, and Perfection
          </h1>
          <p className="text-lg md:text-xl text-neutral-200">
            Experience the art of modern barbering. Book your appointment today
            and discover your perfect look.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent text-white border-white hover:bg-white hover:text-black w-full sm:w-auto"
              >
                Book Now
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent text-white border-white hover:bg-white hover:text-black w-full sm:w-auto"
              >
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
        <p className="max-w-3xl mx-auto text-muted-foreground mb-8">
          We are a team of passionate barbers dedicated to providing you with
          the highest quality grooming services in a relaxed and friendly
          atmosphere.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border rounded-lg bg-background shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Expert Barbers</h3>
            <p className="text-muted-foreground">
              Our skilled professionals are masters of their craft, staying
              updated on the latest trends and techniques.
            </p>
          </div>
          <div className="p-8 border rounded-lg bg-background shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Premium Products</h3>
            <p className="text-muted-foreground">
              We use only the best products to ensure your hair and skin receive
              the care they deserve.
            </p>
          </div>
          <div className="p-8 border rounded-lg bg-background shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Relaxing Atmosphere</h3>
            <p className="text-muted-foreground">
              Sit back, relax, and enjoy a complimentary beverage while we take
              care of the rest.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
        <p className="max-w-3xl mx-auto text-muted-foreground mb-12">
          Don&apos;t just take our word for it. Here&apos;s what our valued
          customers have to say about their experience.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-8 border rounded-lg bg-background shadow-sm flex flex-col"
            >
              <div className="flex items-center mb-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-amber-400 fill-amber-400"
                    />
                  ))}
              </div>
              <p className="text-muted-foreground mb-6 flex-grow">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Valued Customer
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Locations Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Find Your Style, Near You</h2>
          <p className="max-w-3xl mx-auto text-muted-foreground mb-12">
            Two convenient locations, one exceptional standard of service. Visit
            the BarberShop that&apos;s closest to you and experience the
            difference.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div className="p-8 border rounded-lg bg-background shadow-sm">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Downtown Cuts</h3>
                  <p className="text-muted-foreground">
                    123 Main Street, Anytown, USA 12345
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 border rounded-lg bg-background shadow-sm">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Uptown Style</h3>
                  <p className="text-muted-foreground">
                    456 Oak Avenue, Metropolis, USA 67890
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}