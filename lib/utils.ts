import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge only knows the default type scale. Without this, the custom
// `text-label` size (globals.css → --text-label) is read as a text *color*
// and silently dropped whenever a `text-<color>` class follows it in cn().
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['label'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
