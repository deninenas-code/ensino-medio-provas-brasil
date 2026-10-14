import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ESCSimulados - GabaritaBrasil | Catálogo de Simulados & Banco de Questões',
  description: 'Plataforma aberta de simulados para estudantes do Ensino Fundamental II e Médio (ENEM, Prova Paulista, SARESP, OBMEP, FUVEST e OBA) com resolução comentada e cálculo TRI.',
  openGraph: {
    title: 'ESCSimulados - GabaritaBrasil | Catálogo de Simulados & Banco de Questões',
    description: 'Plataforma aberta de simulados para estudantes do Ensino Fundamental II e Médio com resolução comentada e cálculo TRI.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESCSimulados - GabaritaBrasil | Catálogo de Simulados & Banco de Questões',
    description: 'Plataforma aberta de simulados para estudantes do Ensino Fundamental II e Médio com resolução comentada e cálculo TRI.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased text-[#131b2e] bg-[#faf8ff]">
        {children}
      </body>
    </html>
  );
}
