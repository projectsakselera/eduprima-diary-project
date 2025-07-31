"use client"

import * as React from "react"
import { CheckIcon, ClipboardIcon, XIcon, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface CopyableData {
  label: string
  value: string
  sensitive?: boolean
}

interface NotificationAction {
  label: string
  action: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  type: 'success' | 'error' | 'warning' | 'info'
  copyableData?: CopyableData[]
  message?: string
  actions?: NotificationAction[]
  autoCloseMs?: number
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: "text-green-600 dark:text-green-400",
    bgClassName: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
  },
  error: {
    icon: AlertCircle,
    className: "text-red-600 dark:text-red-400", 
    bgClassName: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
  },
  warning: {
    icon: AlertTriangle,
    className: "text-yellow-600 dark:text-yellow-400",
    bgClassName: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
  },
  info: {
    icon: Info,
    className: "text-blue-600 dark:text-blue-400",
    bgClassName: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
  }
}

export function NotificationModal({
  isOpen,
  onClose,
  title,
  type,
  copyableData,
  message,
  actions,
  autoCloseMs
}: NotificationModalProps) {
  const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set())
  const [copiedAll, setCopiedAll] = React.useState(false)
  
  const config = typeConfig[type]
  const IconComponent = config.icon

  // Auto close functionality
  React.useEffect(() => {
    if (autoCloseMs && isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseMs)
      
      return () => clearTimeout(timer)
    }
  }, [autoCloseMs, isOpen, onClose])

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => new Set(prev).add(label))
      
      toast({
        title: "Copied!",
        description: `${label} telah disalin ke clipboard`,
        duration: 2000,
      })

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(label)
          return newSet
        })
      }, 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Gagal menyalin ke clipboard",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const copyAllData = async () => {
    if (!copyableData) return
    
    const formattedText = [
      `${title}`,
      '',
      '📋 Detail:',
      ...copyableData.map(item => `• ${item.label}: ${item.value}`),
      '',
      message || ''
    ].join('\n')

    try {
      await navigator.clipboard.writeText(formattedText)
      setCopiedAll(true)
      
      toast({
        title: "Copied All!",
        description: "Semua data telah disalin ke clipboard",
        duration: 2000,
      })

      setTimeout(() => setCopiedAll(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Gagal menyalin semua data",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className={cn("h-5 w-5", config.className)} />
            {title}
          </DialogTitle>
          {message && (
            <DialogDescription className="text-left">
              {message}
            </DialogDescription>
          )}
        </DialogHeader>

        {copyableData && copyableData.length > 0 && (
          <div className={cn("rounded-lg border p-4 space-y-3", config.bgClassName)}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Data Detail:</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={copyAllData}
                className="text-xs"
              >
                {copiedAll ? (
                  <>
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Copied All!
                  </>
                ) : (
                  <>
                    <ClipboardIcon className="h-3 w-3 mr-1" />
                    Copy All
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-2">
              {copyableData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded border">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className={cn(
                      "text-sm font-mono break-all",
                      item.sensitive && "font-semibold text-foreground"
                    )}>
                      {item.value}
                      {item.sensitive && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          SENSITIF
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(item.value, item.label)}
                    className="h-8 w-8 p-0 ml-2"
                  >
                    {copiedItems.has(item.label) ? (
                      <CheckIcon className="h-3 w-3 text-green-600" />
                    ) : (
                      <ClipboardIcon className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          {actions?.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.action}
            >
              {action.label}
            </Button>
          ))}
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}