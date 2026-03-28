import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  accent?: boolean
}

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, accent }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        accent
          ? 'bg-gradient-to-br from-gold/10 to-gold/5 border-gold/30'
          : 'bg-dark-card border-dark-border'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            accent ? 'bg-gold/20 border border-gold/30' : 'bg-dark-elevated border border-dark-border'
          )}
        >
          <Icon className={cn('w-5 h-5', accent ? 'text-gold' : 'text-gray-400')} />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              trend.positive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
      <p className={cn('text-3xl font-black', accent ? 'text-gold' : 'text-white')}>{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}
