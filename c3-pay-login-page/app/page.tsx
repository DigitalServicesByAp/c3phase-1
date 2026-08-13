import { ChevronLeft } from "lucide-react"
import { C3PayLogo } from "@/components/c3pay-logo"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background px-6 pt-6">
      {/* Header row: back button + logo */}
      <header className="flex items-center justify-between pb-6">
        <button type="button" aria-label="Go back" className="text-navy">
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <C3PayLogo />
      </header>

      <h1 className="mb-10 text-center text-3xl font-extrabold text-navy">Log In</h1>

      <LoginForm />
    </main>
  )
}
