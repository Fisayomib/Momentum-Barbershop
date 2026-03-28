'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { services, categoryLabels, type Service, type ServiceCategory } from '@/data/services'
import { formatNaira, formatDuration, cn } from '@/lib/utils'

interface Props {
  selected: Service[]
  onSelect: (services: Service[]) => void
}

const categories = Object.keys(categoryLabels) as ServiceCategory[]

export default function StepServices({ selected, onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all')

  const filtered =
    activeCategory === 'all' ? services : services.filter((s) => s.category === activeCategory)

  const isSelected = (svc: Service) => selected.some((s) => s.id === svc.id)

  const toggle = (svc: Service) => {
    if (isSelected(svc)) {
      onSelect(selected.filter((s) => s.id !== svc.id))
    } else {
      onSelect([...selected, svc])
    }
  }

  const totalPrice = selected.reduce((sum, s) => sum + s.price, 0)
  const totalDuration = selected.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div>
      <h3 className="text-white font-bold text-xl mb-2">Select Services</h3>
      <p className="text-gray-400 text-sm mb-6">Choose one or more services for your visit</p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            activeCategory === 'all'
              ? 'bg-gold text-dark'
              : 'bg-dark-elevated border border-dark-border text-gray-400 hover:text-white'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeCategory === cat
                ? 'bg-gold text-dark'
                : 'bg-dark-elevated border border-dark-border text-gray-400 hover:text-white'
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {filtered.map((svc) => {
          const active = isSelected(svc)
          return (
            <button
              key={svc.id}
              onClick={() => toggle(svc)}
              className={cn(
                'text-left p-4 rounded-xl border transition-all duration-200',
                active
                  ? 'border-gold bg-gold/10 shadow-sm shadow-gold/20'
                  : 'border-dark-border bg-dark-elevated hover:border-gray-600'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{svc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-semibold text-sm', active ? 'text-white' : 'text-gray-200')}>
                      {svc.name}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{svc.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-gold font-bold text-sm">{formatNaira(svc.price)}</span>
                      <span className="text-gray-500 text-xs">{formatDuration(svc.duration)}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors mt-0.5',
                    active ? 'bg-gold border-gold' : 'border-dark-border'
                  )}
                >
                  {active && <Check className="w-3 h-3 text-dark" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Running total */}
      {selected.length > 0 && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {selected.length} service{selected.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">{formatDuration(totalDuration)}</span>
              <span className="text-gold font-bold text-base">{formatNaira(totalPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
