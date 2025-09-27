'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")

  const handleClickOutside = (e) => {
    if (e.target.id === "overlay") {
      router.push("/")
    }
  }

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const form = new FormData(e.target)
    const email = form.get("email")
    const password = form.get("password")

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      // ✅ Save user session
      localStorage.setItem("user", JSON.stringify(data.user))

      // ✅ Redirect
      router.push("/dashboard")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div
      id="overlay"
      onClick={handleClickOutside}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
    >
      <Card className="w-full max-w-md rounded-2xl shadow-xl border border-border relative">
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter your credentials to log in.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full mt-2">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
