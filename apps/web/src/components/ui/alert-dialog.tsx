'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

const AlertDialog = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]">
        {children}
      </div>
    </div>
  )
}

const AlertDialogContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
    {...props}
  />
)

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)

const AlertDialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
))
AlertDialogTitle.displayName = 'AlertDialogTitle'

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
AlertDialogDescription.displayName = 'AlertDialogDescription'

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <Button ref={ref} className={className} {...props} />
))
AlertDialogAction.displayName = 'AlertDialogAction'

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <Button ref={ref} variant="outline" className={className} {...props} />
))
AlertDialogCancel.displayName = 'AlertDialogCancel'

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
