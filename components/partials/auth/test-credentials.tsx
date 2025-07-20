'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TestCredentialsProps {
  onSelectCredentials: (email: string, password: string) => void
}

export function TestCredentials({ onSelectCredentials }: TestCredentialsProps) {
  const testUsers = [
    {
      name: "Super Admin",
      email: "amhar.idn@gmail.com",
      password: "password123",
      role: "Full Access",
      color: "bg-blue-500"
    },
    {
      name: "Database Tutor Manager",
      email: "em@eduprima.id", 
      password: "password123",
      role: "Database Tutor Only",
      color: "bg-green-500"
    }
  ]

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🧪 Test Credentials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {testUsers.map((user) => (
          <div key={user.email} className="flex items-center justify-between p-2 rounded border">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${user.color}`}></div>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectCredentials(user.email, user.password)}
            >
              Use
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 