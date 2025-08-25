"use client";

import type { BundledLanguage } from 'shiki/bundle/web';
import { use } from 'react';
import { highlight } from './shared';

interface Props {
    children: string;
    lang: BundledLanguage;
    theme: string;
}

export function CodeBlock({ children, lang, theme }: Props) {
    return use(highlight(children, lang, theme));
}

