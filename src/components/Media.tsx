import { useState } from "react";
import { photoUrl, type Photo } from "../content/media";

const WIDTHS = [480, 800, 1200, 1600, 2200];

type ImgProps = {
  photo: Photo;
  /** CSS sizes hint; defaults to full viewport width. */
  sizes?: string;
  eager?: boolean;
  /** Load immediately without competing for priority; for images inside moving tracks. */
  preload?: boolean;
  className?: string;
  /** Decorative images inside mockups pass an empty alt. */
  decorative?: boolean;
};

/**
 * Fills its parent (which sets the aspect ratio, so nothing shifts on load).
 * If the request fails the image hides and the parent's background shows.
 */
export function Img({ photo, sizes = "100vw", eager, preload, className = "", decorative }: ImgProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={photoUrl(photo, 1200)}
      srcSet={WIDTHS.map((w) => `${photoUrl(photo, w)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={decorative ? "" : photo.alt}
      loading={eager || preload ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : undefined}
      draggable={false}
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
