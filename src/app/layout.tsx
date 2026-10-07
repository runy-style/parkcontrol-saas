import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import SmoothScroll from '@/components/SmoothScroll'
import SpotlightCursor from '@/components/SpotlightCursor'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ParkControl PRO — Software para Estacionamientos | Cobro al Segundo y Gestión en la Nube',
  description: 'La plataforma SaaS líder en gestión de estacionamientos y playas de autos. Cobro al segundo, tickets por WhatsApp, arqueo ciego y control en tiempo real desde cualquier dispositivo.',
  manifest: '/manifest.json',
  icons: { apple: '/icon-192.png' },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased relative`}>
        <SpotlightCursor />
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) {
                      console.log('PWA ServiceWorker registered successfully:', reg.scope);
                    },
                    function(err) {
                      console.error('PWA ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
