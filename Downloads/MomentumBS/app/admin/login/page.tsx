'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scissors, Lock, Eye, EyeOff } from 'lucide-react'

const ADMIN_PASSWORD = 'momentum2024'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminAuth', 'true')
        router.push('/admin')
      } else {
        setError('Incorrect password. Please try again.')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-7 h-7 text-gold" />
          </div>
          <h1 className="text-white font-black text-2xl">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Momentum Barbershop & Spa</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input-dark w-full pl-10 pr-10 py-3 rounded-xl text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full bg-gold hover:bg-gold-light disabled:bg-gold/40 disabled:cursor-not-allowed text-dark font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-4">
          Customer-facing site →{' '}
          <a href="/" className="text-gold hover:underline">
            momentumbarbershop.com
          </a>
        </p>
      </div>
    </div>
  )
}
