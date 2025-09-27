'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-center text-center gap-6 relative">
      {/* Toggle Button in Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <h1 className="text-5xl font-bold tracking-tight">
        Welcome to <span className="text-primary">SkillQuest</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl">
        A gamified platform to track your skills, complete quests, and level up your future.
      </p>
      <div className="flex gap-4">
        <Link href="/register">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">Login</Button>
        </Link>
      </div>
    </section>
  )
}
