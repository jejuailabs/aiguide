"use client"

import * as React from "react"
import {
  MessageSquare, Sparkles, Image, ImagePlus, Clapperboard, Video, Music, Mic,
  Presentation, Code2, Blocks, Search, QrCode, Braces, Binary, FileCode, Link,
  Type, Palette, KeyRound, Wand2, FileText, FileType, Globe, Terminal,
  type LucideIcon,
} from "lucide-react"

const MAP: Record<string, LucideIcon> = {
  MessageSquare, Sparkles, Image, ImagePlus, Clapperboard, Video, Music, Mic,
  Presentation, Code2, Blocks, Search, QrCode, Braces, Binary, FileCode, Link,
  Type, Palette, KeyRound, Wand2, FileText, FileType, Globe, Terminal,
}

export function DynamicIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = MAP[name] ?? Sparkles
  return <Icon className={className} />
}
