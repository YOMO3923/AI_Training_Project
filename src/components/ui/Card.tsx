import * as React from 'react'

import { cn } from '@/lib/utils'

// Card 全体の props 型（div に渡せる属性を継承）
type CardProps = React.HTMLAttributes<HTMLDivElement>

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

type CardContentProps = React.HTMLAttributes<HTMLDivElement>

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

// forwardRef は親から渡された ref を内部の div へ渡す React の仕組み
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 角丸、半透明背景、影などカードの基本デザイン
      'rounded-3xl border border-white/70 bg-white/80 text-[#111827] shadow-[0_18px_60px_rgba(31,41,55,0.12)] backdrop-blur',
      className,
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    // flex-col で縦並び、space-y で余白を調整
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-[#6b7280]', className)} {...props} />
  ),
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
