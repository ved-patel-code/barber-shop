// src/app/(public)/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center text-center text-white px-4">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <Image
          src="/hero-image.jpg"
          alt="Modern barber shop interior"
          fill
          className="object-cover z-0"
          priority // Prioritize loading the hero image
        />
        <div className="relative z-20 space-y-6 max-w-xs sm:max-w-2xl lg:max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Style, Precision, and Perfection
          </h1>
          <p className="text-lg md:text-xl text-neutral-200">
            Experience the art of modern barbering. Book your appointment today
            and discover your perfect look.
          </p>
          {/* This container now stacks buttons on small screens */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book" className="w-full sm:w-auto">
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
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

      {/* About Us Section */}
      <section className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
        <p className="max-w-3xl mx-auto text-muted-foreground mb-8">
          We are a team of passionate barbers dedicated to providing you with
          the highest quality grooming services in a relaxed and friendly
          atmosphere.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Expert Barbers</h3>
            <p className="text-muted-foreground">
              Our skilled professionals are masters of their craft, staying
              updated on the latest trends and techniques.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Premium Products</h3>
            <p className="text-muted-foreground">
              We use only the best products to ensure your hair and skin receive
              the care they deserve.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Relaxing Atmosphere</h3>
            <p className="text-muted-foreground">
              Sit back, relax, and enjoy a complimentary beverage while we take
              care of the rest.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
