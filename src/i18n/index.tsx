import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import en from './locales/en.json'
import fr from './locales/fr.json'
import vi from './locales/vi.json'
import { storageGet, storageSet } from '../storage'

const locales: Record<string, any> = { en, fr, vi, vn: vi }
export type Lang = 'en' | 'fr' | 'vi' | 'vn'
const STORAGE_KEY = 'flatland_lang'

function safeGet(key: string): string | null {
  return storageGet('localStorage', key) ?? storageGet('sessionStorage', key)
}
function safeSet(key: string, val: string) {
  if (!storageSet('localStorage', key, val)) storageSet('sessionStorage', key, val)
}
function getInitialLang(): Lang {
  const saved = safeGet(STORAGE_KEY) as Lang | null
  if (saved && locales[saved]) return saved === 'vn' ? 'vi' : saved
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : 'en'
  if (nav === 'vi' || nav === 'vn') return 'vi'
  if (nav === 'fr') return 'fr'
  return 'en'
}

function resolve(path: string, dict: any): string {
  const parts = path.split('.')
  let cur = dict
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
    else return path
  }
  return typeof cur === 'string' ? cur : path
}

export function escapeHtml(val: unknown): string {
  if (val == null) return ''
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function interpolate(str: string, vars?: Record<string, any>, html = false): string {
  if (!vars) return str
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (vars[key] == null) return `{{${key}}}`
    const value = String(vars[key])
    return html ? escapeHtml(value) : value
  })
}

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, vars?: Record<string, any>) => string
  tHtml: (key: string, vars?: Record<string, any>) => string
}

const Ctx = createContext<I18nCtx>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  tHtml: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangRaw] = useState<Lang>(getInitialLang)
  const setLang = (l: Lang) => {
    const normalized = l === 'vn' ? 'vi' : (l as Lang)
    safeSet(STORAGE_KEY, normalized)
    setLangRaw(normalized)
    document.documentElement.lang = normalized
  }
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const dict = locales[lang] ?? en
  const t = (key: string, vars?: Record<string, any>) => interpolate(resolve(key, dict), vars)
  const tHtml = (key: string, vars?: Record<string, any>) => interpolate(resolve(key, dict), vars, true)
  return <Ctx.Provider value={{ lang, setLang, t, tHtml }}>{children}</Ctx.Provider>
}

export function useI18n() {
  return useContext(Ctx)
}
export function useT() {
  return useContext(Ctx).t
}

export function getTranslator(lang: string) {
  const normalized = lang === 'vn' ? 'vi' : lang
  const dict = locales[normalized] ?? en
  return (key: string, vars?: Record<string, any>) => interpolate(resolve(key, dict), vars)
}

