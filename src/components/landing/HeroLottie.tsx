'use client';
// Loads a Lottie JSON from /public at runtime (kept out of the JS bundle) and
// plays it. Returns nothing until loaded so it never blocks first paint.
import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export default function HeroLottie({ src, className }: { src: string; className?: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    let on = true;
    fetch(src).then((r) => r.json()).then((d) => { if (on) setData(d); }).catch(() => {});
    return () => { on = false; };
  }, [src]);
  if (!data) return null;
  return <Lottie animationData={data} loop autoplay className={className} rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }} />;
}
