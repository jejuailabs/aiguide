"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Download, ExternalLink, Copy, Check, Terminal, GitBranch, User, Mail,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function CopyBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      )}
      <div className="group relative flex items-center rounded-lg bg-muted/60 ring-1 ring-border/50">
        <code className="flex-1 overflow-x-auto whitespace-pre px-3 py-2.5 text-sm font-mono">
          {value}
        </code>
        <button
          onClick={copy}
          className="shrink-0 p-2.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="복사"
        >
          {copied ? (
            <Check className="size-4 text-emerald-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
    </div>
  )
}

const DOWNLOADS = [
  {
    name: "Git",
    desc: "버전 관리 & 협업 필수 도구",
    url: "https://git-scm.com/downloads",
    color: "from-orange-500/20 to-orange-500/0",
  },
  {
    name: "Node.js",
    desc: "JavaScript 런타임 (LTS 권장)",
    url: "https://nodejs.org/ko",
    color: "from-green-500/20 to-green-500/0",
  },
  {
    name: "VS Code",
    desc: "코드 에디터",
    url: "https://code.visualstudio.com/download",
    color: "from-blue-500/20 to-blue-500/0",
  },
]

const PROJECT_LINKS = [
  {
    name: "Firebase",
    desc: "백엔드 & 인증 & DB",
    url: "https://console.firebase.google.com/",
    color: "from-amber-500/20 to-amber-500/0",
  },
  {
    name: "GitHub",
    desc: "코드 저장소 & 협업",
    url: "https://github.com/new",
    color: "from-slate-500/20 to-slate-500/0",
  },
  {
    name: "Vercel",
    desc: "배포 & 호스팅",
    url: "https://vercel.com/new",
    color: "from-violet-500/20 to-violet-500/0",
  },
]

const ENV_COMMANDS = [
  {
    label: "Node.js 글로벌 PATH 등록 (시스템 환경변수)",
    value: `[System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\\Program Files\\nodejs", "Machine")`,
  },
  {
    label: "npm 글로벌 PATH 등록",
    value: `[System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";" + $env:APPDATA + "\\npm", "Machine")`,
  },
  {
    label: "Git 글로벌 PATH 등록",
    value: `[System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\\Program Files\\Git\\cmd", "Machine")`,
  },
]

export function VibeGuideView() {
  const [gitName, setGitName] = React.useState("")
  const [gitEmail, setGitEmail] = React.useState("")
  const [copiedGit, setCopiedGit] = React.useState(false)

  const gitConfigCmd = `git config --global user.name "${gitName || "your-username"}"\ngit config --global user.email "${gitEmail || "your-email@example.com"}"`

  const copyGitConfig = () => {
    navigator.clipboard.writeText(gitConfigCmd)
    setCopiedGit(true)
    setTimeout(() => setCopiedGit(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-3">
            <Terminal className="mr-1.5 size-3" />
            시작 가이드
          </Badge>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            바이브코딩 시작 가이드
          </h1>
          <p className="mt-2 text-muted-foreground">
            개발 환경 설정부터 프로젝트 생성까지, 한 페이지로 끝내세요.
          </p>
        </div>

        {/* Section 1: Downloads */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Download className="size-5 text-primary" />
            필수 프로그램 다운로드
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {DOWNLOADS.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="relative overflow-hidden p-4 transition-all hover:ring-1 hover:ring-primary/30 hover:shadow-md">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", item.color)} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">{item.name}</span>
                      <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Section 2: Project Links */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <ExternalLink className="size-5 text-primary" />
            프로젝트 생성 바로가기
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {PROJECT_LINKS.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="relative overflow-hidden p-4 transition-all hover:ring-1 hover:ring-primary/30 hover:shadow-md">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", item.color)} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">{item.name}</span>
                      <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Section 3: Environment Variable Commands */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Terminal className="size-5 text-primary" />
            환경변수 글로벌 PATH 등록 (PowerShell 관리자 모드)
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            아래 명령어를 PowerShell <strong>관리자 권한</strong>으로 실행하면, 어떤 폴더에서든 명령어가 동작합니다.
          </p>
          <Card className="space-y-4 p-4">
            {ENV_COMMANDS.map((cmd) => (
              <CopyBlock key={cmd.label} label={cmd.label} value={cmd.value} />
            ))}
          </Card>
        </section>

        {/* Section 4: Git Config */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <GitBranch className="size-5 text-primary" />
            GitHub 계정 설정
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            아이디와 이메일을 입력하면 바로 복사 가능한 Git 설정 명령어가 생성됩니다.
          </p>
          <Card className="p-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <User className="size-3" />
                  GitHub 사용자 이름
                </label>
                <Input
                  placeholder="your-username"
                  value={gitName}
                  onChange={(e) => setGitName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Mail className="size-3" />
                  GitHub 이메일
                </label>
                <Input
                  type="email"
                  placeholder="your-email@example.com"
                  value={gitEmail}
                  onChange={(e) => setGitEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">생성된 명령어</p>
              <div className="group relative rounded-lg bg-muted/60 ring-1 ring-border/50">
                <pre className="overflow-x-auto whitespace-pre px-3 py-2.5 text-sm font-mono">
                  {gitConfigCmd}
                </pre>
                <button
                  onClick={copyGitConfig}
                  className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="복사"
                >
                  {copiedGit ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={copyGitConfig}
              className="w-full"
              variant="outline"
            >
              {copiedGit ? (
                <>
                  <Check className="mr-2 size-4" />
                  복사 완료!
                </>
              ) : (
                <>
                  <Copy className="mr-2 size-4" />
                  명령어 복사하기
                </>
              )}
            </Button>
          </Card>
        </section>
      </motion.div>
    </div>
  )
}
