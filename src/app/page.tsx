"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useNav } from "@/lib/store"
import { useAuth } from "@/lib/auth"
import { HomeView } from "@/components/views/home-view"
import { ToolsView } from "@/components/views/tools-view"
import { PromptsView } from "@/components/views/prompts-view"
import { MetaPromptView } from "@/components/views/meta-prompt-view"
import { MiniToolsView } from "@/components/views/mini-tools-view"
import { SolutionsView } from "@/components/views/solutions-view"
import { CommunityView } from "@/components/views/community-view"
import { MyPageView } from "@/components/views/my-page-view"
import { AdminView } from "@/components/views/admin-view"

export default function Page() {
  const view = useNav((s) => s.view)
  const hydrate = useAuth((s) => s.hydrate)
  hydrate()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "home" && <HomeView />}
            {view === "tools" && <ToolsView />}
            {view === "prompts" && <PromptsView />}
            {view === "meta-prompt" && <MetaPromptView />}
            {view === "mini-tools" && <MiniToolsView />}
            {view === "solutions" && <SolutionsView />}
            {view === "community" && <CommunityView />}
            {view === "my-page" && <MyPageView />}
            {view === "admin" && <AdminView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
