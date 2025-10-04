import React from 'react'
import { Button } from "./ui/button"
import { Trophy, User } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  // Don't show navbar on landing page
  if (location.pathname === "/") return null

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
        >
          <h1 className="font-aston text-4xl text-foreground">GitHunter</h1>
        </button>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/leaderboard")}
            className="animate-button-hover"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full animate-button-hover bg-transparent">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/org/dashboard")}>Organization Dashboard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dev/dashboard")}>Developer Dashboard</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}