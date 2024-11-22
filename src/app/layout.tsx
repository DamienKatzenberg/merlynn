import Link from 'next/link'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TOM API Integration',
  description: 'Merlynn Intelligence Technologies Coding Assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">TOM API Integration</h1>
          </header>
          <div className='flex gap-8 mb-8'>
            <Link href="/"><h3 className="text-xl font-bold text-gray-800">New Prompt</h3></Link>
            <Link href="/decisions"><h3 className="text-xl font-bold text-gray-800">Decisions</h3></Link>
          </div>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}

