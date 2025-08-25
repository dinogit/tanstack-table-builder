import type { JSX } from 'react'
import type { BundledLanguage } from 'shiki/bundle/web'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { codeToHast } from 'shiki/bundle/web'

const cache = new Map<string, Promise<JSX.Element>>()

export function highlight(code: string, lang: BundledLanguage, theme: string) {
    const key = `${code}-${lang}-${theme}`

    if (!cache.has(key)) {
        const promise = codeToHast(code, {
            lang,
            theme: theme
        }).then(out =>
            toJsxRuntime(out, {
                Fragment,
                jsx,
                jsxs,
            }) as JSX.Element
        )

        cache.set(key, promise)
    }

    return cache.get(key)!
}