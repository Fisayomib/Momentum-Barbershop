'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  from: 'bot' | 'user'
  text: string
  timestamp: Date
}

const QUICK_REPLIES = [
  'What are your prices?',
  'Where are you located?',
  'What services do you offer?',
  'How do I reschedule?',
  'What are your opening hours?',
]

function getBotResponse(input: string): string {
  const lower = input.toLowerCase()

  if (/(price|cost|how much|fee|rate|charge)/i.test(lower)) {
    return `Here's a quick pricing overview:\n\n✂️ Haircuts: ₦2,500 – ₦5,000\n🧴 Facials: ₦3,500 – ₦6,000\n💆 Massage: ₦8,000 – ₦12,000\n🦷 Teeth Whitening: ₦15,000\n💅 Manicure/Pedicure: ₦3,000 – ₦6,500\n\nFor full details, visit our Services page or book directly!`
  }

  if (/(where|location|address|find|direction|map)/i.test(lower)) {
    return `We're located at:\n\n📍 15 Freedom Way, Lekki Phase 1, Lagos, Nigeria\n\nWe're open Mon–Sat: 9:00 AM – 8:00 PM and Sunday: 10:00 AM – 6:00 PM.\n\nNeed directions? Visit our Contact page for the map!`
  }

  if (/(service|offer|what do|treatment|do you)/i.test(lower)) {
    return `We offer a wide range of premium services:\n\n✂️ Haircuts & Fades\n🧔 Beard Grooming\n🧴 Facials & Skincare\n💆 Massage Therapy\n🦷 Teeth Whitening\n💅 Manicure & Pedicure\n\nYou can explore all services and book online at any time!`
  }

  if (/(reschedule|cancel|change|move|modify)/i.test(lower)) {
    return `To reschedule your appointment:\n\n1. Call us at +234 803 456 7890\n2. WhatsApp us — we'll sort it out quickly\n3. Make a new booking online and let us know via phone\n\nWe ask for at least 2 hours notice before rescheduling. We're flexible and happy to help!`
  }

  if (/(hour|open|time|close|when)/i.test(lower)) {
    return `Our business hours are:\n\n📅 Monday – Saturday: 9:00 AM – 8:00 PM\n📅 Sunday: 10:00 AM – 6:00 PM\n\nYou can book appointments online 24/7!`
  }

  if (/(whatsapp|contact|phone|call|reach)/i.test(lower)) {
    return `You can reach us through:\n\n📞 Call: +234 803 456 7890\n💬 WhatsApp: wa.me/2348034567890\n📸 Instagram: @momentumbarbershop\n\nWe're quick to respond!`
  }

  if (/(book|appointment|slot|reserve)/i.test(lower)) {
    return `Booking is easy!\n\nJust head to our Booking page, choose your services, pick a date & time, and confirm. It takes less than 2 minutes.\n\nWould you like me to help with anything else?`
  }

  if (/(hello|hi|hey|good morning|good afternoon|howdy)/i.test(lower)) {
    return `Hi there! 👋 Welcome to Momentum Barbershop & Spa.\n\nI'm here to help you with pricing, services, bookings, and more. What can I do for you today?`
  }

  return `Thanks for reaching out! I'm not sure I understood that, but I'm here to help.\n\nYou can ask me about:\n• Prices & services\n• Location & hours\n• Booking & rescheduling\n• Contact details\n\nOr feel free to call us at +234 803 456 7890.`
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      from: 'bot',
      text: "Hi! 👋 Thanks for visiting Momentum Barbershop & Spa. I'm here to help — ask me anything about our services, pricing, or bookings!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      from: 'bot',
      text: getBotResponse(text),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput('')
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setOpen(true)}
              className="w-14 h-14 rounded-full bg-gold hover:bg-gold-light text-dark flex items-center justify-center shadow-xl shadow-gold/30 animate-pulse-gold transition-colors"
              aria-label="Open chat"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 right-0 w-[340px] sm:w-[380px] bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ height: 520 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-dark-elevated border-b border-dark-border shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Momentum Assistant</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <p className="text-gray-500 text-xs">Online</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] px-3 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed',
                        msg.from === 'user'
                          ? 'bg-gold text-dark font-medium rounded-br-sm'
                          : 'bg-dark-elevated border border-dark-border text-gray-200 rounded-bl-sm'
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
              <div className="px-3 py-2 flex gap-2 overflow-x-auto shrink-0 border-t border-dark-border scrollbar-none">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => send(qr)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-dark-elevated border border-dark-border text-gray-400 hover:text-white hover:border-gold transition-colors whitespace-nowrap"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-3 pb-3 pt-2 shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); send(input) }}
                  className="flex items-center gap-2 bg-dark-elevated border border-dark-border rounded-xl px-3 py-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-7 h-7 rounded-lg bg-gold hover:bg-gold-light text-dark flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
