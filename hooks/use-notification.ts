"use client"

import * as React from "react"

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

interface NotificationOptions {
  title: string
  type: 'success' | 'error' | 'warning' | 'info'
  copyableData?: CopyableData[]
  message?: string
  actions?: NotificationAction[]
  autoCloseMs?: number
}

interface NotificationState extends NotificationOptions {
  isOpen: boolean
}

const initialState: NotificationState = {
  isOpen: false,
  title: '',
  type: 'info'
}

export function useNotification() {
  const [notification, setNotification] = React.useState<NotificationState>(initialState)

  const showNotification = React.useCallback((options: NotificationOptions) => {
    setNotification({
      ...options,
      isOpen: true
    })
  }, [])

  const hideNotification = React.useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  const showSuccess = React.useCallback((
    title: string,
    options?: Omit<NotificationOptions, 'title' | 'type'>
  ) => {
    showNotification({ ...options, title, type: 'success' })
  }, [showNotification])

  const showError = React.useCallback((
    title: string,
    options?: Omit<NotificationOptions, 'title' | 'type'>
  ) => {
    showNotification({ ...options, title, type: 'error' })
  }, [showNotification])

  const showWarning = React.useCallback((
    title: string,
    options?: Omit<NotificationOptions, 'title' | 'type'>
  ) => {
    showNotification({ ...options, title, type: 'warning' })
  }, [showNotification])

  const showInfo = React.useCallback((
    title: string,
    options?: Omit<NotificationOptions, 'title' | 'type'>
  ) => {
    showNotification({ ...options, title, type: 'info' })
  }, [showNotification])

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}