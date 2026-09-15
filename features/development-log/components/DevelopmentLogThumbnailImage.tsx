'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type DevelopmentLogThumbnailImageProps = {
  loading: 'eager' | 'lazy'
  src: string
  quality?: number
  unoptimized: boolean
}

type ImageLoadingStatus = 'loading' | 'loaded' | 'failed'

export default function DevelopmentLogThumbnailImage({
  loading,
  src,
  quality,
  unoptimized,
}: DevelopmentLogThumbnailImageProps) {
  const [loadingStatus, setLoadingStatus] = useState<ImageLoadingStatus>('loading')
  const imageRef = useRef<HTMLImageElement>(null)
  const isLoading = loadingStatus === 'loading'
  const isLoaded = loadingStatus === 'loaded'

  useEffect(() => {
    const image = imageRef.current
    if (!image?.complete) return

    setLoadingStatus(image.naturalWidth > 0 ? 'loaded' : 'failed')
  }, [src])

  return (
    <>
      <div
        className={`absolute inset-0 bg-slate-700/35 transition-opacity duration-300 motion-reduce:animate-none motion-reduce:transition-none ${
          isLoading ? 'animate-pulse opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />
      <Image
        ref={imageRef}
        src={src}
        alt=""
        fill
        loading={loading}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        quality={quality}
        unoptimized={unoptimized}
        onLoad={() => setLoadingStatus('loaded')}
        onError={() => setLoadingStatus('failed')}
        className={`object-cover object-center transition-[opacity,transform] duration-300 ease-out motion-reduce:scale-100 motion-reduce:transition-none ${
          isLoaded
            ? 'scale-100 opacity-100 group-hover:scale-[1.025]'
            : 'scale-[1.02] opacity-0'
        }`}
      />
    </>
  )
}
