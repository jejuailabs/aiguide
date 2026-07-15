"use client"

import { motion } from "framer-motion"

export function ViewHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string
  title: string
  desc: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl"
    >
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-accent/30 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
        {eyebrow}
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{desc}</p>
    </motion.div>
  )
}
