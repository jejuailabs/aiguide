"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, Check, AlertCircle } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { useNav } from "@/lib/store"
import { toast } from "sonner"

type Stage = "idle" | "loading" | "done" | "error"

export function LoginModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { loginWithGoogle, loginAsGuest } = useAuth()
  const { go } = useNav()
  const [stage, setStage] = React.useState<Stage>("idle")
  const [errorMsg, setErrorMsg] = React.useState("")

  const reset = () => { setStage("idle"); setErrorMsg("") }

  const handleGoogle = async () => {
    setStage("loading")
    try {
      const user = await loginWithGoogle()
      setStage("done")
      setTimeout(() => {
        onOpenChange(false)
        setStage("idle")
        toast.success(`${user.name}님, 환영합니다`, {
          description: user.tier === "admin" ? "관리자 권한으로 로그인되었습니다." : undefined,
        })
        if (user.tier === "admin") go("admin")
      }, 800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "로그인 실패"
      if (msg.includes("popup-closed") || msg.includes("cancelled")) {
        setStage("idle")
        return
      }
      setErrorMsg(msg)
      setStage("error")
    }
  }

  const handleGuest = () => {
    loginAsGuest()
    onOpenChange(false)
    toast("게스트 모드로 둘러봅니다", {
      description: "일부 기능이 제한될 수 있습니다.",
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/40 to-transparent p-7">
          <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.03]" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <DialogHeader className="relative space-y-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-background/70 text-primary ring-1 ring-primary/20 backdrop-blur">
              <Sparkles className="size-6" />
            </span>
            <DialogTitle className="font-serif text-2xl font-semibold tracking-tight">
              AI Guide Portal
            </DialogTitle>
            <DialogDescription className="text-sm">
              로그인하면 즐겨찾기, 개인 프롬프트 저장소,
              <br className="hidden sm:block" />
              커뮤니티 활동을 이어갈 수 있습니다.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 p-7 pt-2">
          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <button
                  onClick={handleGoogle}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border/70 bg-background px-4 py-3 text-sm font-medium shadow-sm transition-all hover:bg-accent/40 hover:shadow-md"
                >
                  <GoogleLogo className="size-5" />
                  Google 계정으로 로그인
                </button>

                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border/60" />
                  <span className="text-[0.7rem] text-muted-foreground">또는</span>
                  <span className="h-px flex-1 bg-border/60" />
                </div>

                <button
                  onClick={handleGuest}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                >
                  게스트로 둘러보기
                </button>

                <p className="pt-2 text-center text-[0.68rem] leading-relaxed text-muted-foreground/70">
                  로그인 시 서비스 이용약관 및 개인정보처리방침에 동의합니다.
                </p>
              </motion.div>
            )}

            {stage === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <Loader2 className="size-7 animate-spin text-primary" />
                <p className="mt-4 text-sm font-medium">Google 로그인 중…</p>
                <p className="mt-1 text-xs text-muted-foreground">팝업 창에서 계정을 선택해주세요</p>
              </motion.div>
            )}

            {stage === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary"
                >
                  <Check className="size-6" />
                </motion.span>
                <p className="mt-4 text-sm font-medium">로그인 완료!</p>
              </motion.div>
            )}

            {stage === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-8 text-center"
              >
                <AlertCircle className="size-8 text-destructive" />
                <div>
                  <p className="text-sm font-medium">로그인에 실패했습니다</p>
                  <p className="mt-1 text-xs text-muted-foreground">{errorMsg}</p>
                </div>
                <button
                  onClick={reset}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  다시 시도
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
