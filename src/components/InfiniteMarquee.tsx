import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Props = {
  text?: string
  direction?: 'left' | 'right'
  duration?: number
  className?: string
}

// A simple, dependency-free marquee using framer-motion. It duplicates the content
// to create a seamless infinite scroll effect.
export default function InfiniteMarquee({
  text = 'Marketplace - UMKM Nearby - Chatbot AI',
  direction = 'right',
  duration = 20,
  className,
}: Props) {
  const copies = 2 // two copies for seamless loop

  return (
    <div className={cn('w-full overflow-hidden bg-[#FF2000]', className)}>
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={{ x: direction === 'right' ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ ease: 'linear', repeat: Infinity, duration }}
        aria-hidden
      >
        {Array.from({ length: copies }).map((_, i) => (
          <MarqueeChunk key={i} text={text} />
        ))}
      </motion.div>
    </div>
  )
}

function MarqueeChunk({ text }: { text: string }) {
  // Repeat the phrase several times to ensure it spans wide screens
  const times = 8
  return (
    <div className="flex items-center">
      {Array.from({ length: times }).map((_, i) => (
        <span
          key={i}
          className="text-white uppercase font-semibold tracking-wide px-8 py-3 md:py-4"
        >
          {text}
        </span>
      ))}
    </div>
  )
}
