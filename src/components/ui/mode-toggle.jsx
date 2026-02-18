import React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownItem,
} from "../ui/dropdown-menu"
import { useTheme } from "../theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  const trigger = (
    <Button variant="outline" size="icon" className="relative">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );

  return (
    <DropdownMenu trigger={trigger} align="right">
        <DropdownItem onClick={() => setTheme("light")}>
          Claro
        </DropdownItem>
        <DropdownItem onClick={() => setTheme("dark")}>
          Oscuro
        </DropdownItem>
        <DropdownItem onClick={() => setTheme("system")}>
          Sistema
        </DropdownItem>
    </DropdownMenu>
  )
}
