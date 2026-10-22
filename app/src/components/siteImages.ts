// Illustrative photos (Unsplash License), stored in public/images. They are not the fictional sites themselves.
// A site without an entry falls back to its code-drawn survey plate.
export type SitePhoto = { src: string; credit: string; href: string };

export const HERO_PHOTO: SitePhoto | null = {
  src: "/images/hero.jpg",
  credit: "@trnavskauni",
  href: "https://unsplash.com/photos/ELr8gYeLdPo",
};

export const SITE_PHOTOS: Record<string, SitePhoto> = {
  "site-thornwick-hollow": {
    src: "/images/thornwick-hollow.jpg",
    credit: "@aleksander_stypczynski",
    href: "https://unsplash.com/photos/s-y8QSmpyNI",
  },
  "site-mirelake-causeway": {
    src: "/images/mirelake-causeway.jpg",
    credit: "Michael Nau",
    href: "https://unsplash.com/photos/pBSHSp_8X3s",
  },
  "site-calder-rise-ossuary": {
    src: "/images/calder-rise-ossuary.jpg",
    credit: "@makimesa",
    href: "https://unsplash.com/photos/foPDnbRbGQ4",
  },
};

export const ALL_PHOTOS: SitePhoto[] = [HERO_PHOTO, ...Object.values(SITE_PHOTOS)].filter(Boolean) as SitePhoto[];
