"use client"

import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { ChevronRight, Moon, Sun } from "lucide-react"
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface AgentHeaderProps {
  agentName: string
  agentVersion: string
  onOpenTestPanel: () => void
}

export default function AgentHeader({ agentName, agentVersion, onOpenTestPanel }: AgentHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="flex items-center justify-between h-14 border-b px-4">
      <div className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-foreground text-background">R</div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{agentName}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className="rounded-full">
          {agentVersion}
        </Badge>
      </div>
      <div className="flex items-center space-x-2">
        {mounted && (
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        )}
        <Button variant="default" className="bg-foreground text-background" onClick={onOpenTestPanel}>
          Test
        </Button>
      </div>
    </header>
  )
}

