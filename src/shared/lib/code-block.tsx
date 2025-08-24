import {BundledLanguage, codeToHtml} from "shiki";

interface Props {
    children: string
    lang: BundledLanguage
}

export async function CodeBlock(props: Props) {
    const out = await codeToHtml(props.children, {
        lang: props.lang,
        theme: 'github-dark'
    })

    return <div dangerouslySetInnerHTML={{ __html: out }} />
}