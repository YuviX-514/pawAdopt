"use client";

import Image from "next/image";

export default function AuthPoster() {
  return (
    <Image
  src="/poster.png"
  alt="Poster"
  width={600}
  height={400}
  className="object-cover"
/>

  );
}
