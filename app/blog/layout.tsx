import { ReactNode } from 'react'

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('data-theme','dark');`,
        }}
      />
      <div data-theme="dark">
        {children}
      </div>
    </>
  )
}
