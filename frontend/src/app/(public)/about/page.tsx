// src/app/(public)/about/page.tsx
"use client";

import Image from "next/image";
import { siteImages } from "@/lib/images";

export default function AboutUsPage() {
  return (
    <>
      {/* Page Banner Section */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center text-center text-white px-4">
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        <Image
          src={siteImages.aboutUs.banner}
          alt="Interior of the barbershop"
          fill
          // We keep 'object-cover' but remove the positioning classes
          className="object-cover z-0"
          priority
          // --- THE FIX IS HERE ---
          // This style prop gives us precise control over the image's focal point.
          // 'center' keeps it horizontally centered.
          // '25%' sets the vertical focal point 25% down from the top of the image.
          style={{
            objectPosition: "center 25%",
          }}
        />
        <div className="relative z-20">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            About Our Craft
          </h1>
        </div>
      </section>
      {/* Content Section */}
      <section className="container mx-auto py-12 sm:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Welcome to BarberShop, where timeless tradition meets modern
              style. Founded on the principles of quality, precision, and a
              passion for grooming, our shop is more than just a place to get a
              haircut—it&apos;s an experience. We believe that a great haircut
              can change not just your look, but your entire outlook.
            </p>
            <p>
              Our team of expert barbers are not just stylists; they are artists
              who have honed their craft over years of dedicated practice. Each
              member is committed to understanding your unique style and
              delivering a personalized service that exceeds your expectations.
              We use only the finest products and the sharpest tools to ensure
              every cut, shave, and trim is executed to perfection.
            </p>
            <p>
              Step into our relaxed and friendly atmosphere, leave the hustle of
              the outside world behind, and let us take care of you. We look
              forward to welcoming you to the BarberShop family.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
