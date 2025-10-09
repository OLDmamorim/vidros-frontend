import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  
  // Usar versão branca sempre (funciona melhor em fundos escuros)
  const logoSrc = '/turned_real_white.png';
  
  return (
    <footer className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 pointer-events-none">
      <a 
        href="https://nexai.pt" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block pointer-events-auto group"
        title="Developed by NEXAI"
      >
        <div className="bg-black/20 backdrop-blur-sm rounded px-2 py-1 transition-all duration-300 group-hover:bg-black/40">
          <img 
            src={logoSrc}
            alt="turned_real by NEXAI" 
            className="h-4 sm:h-6 w-auto opacity-60 group-hover:opacity-90 transition-opacity duration-300"
          />
        </div>
      </a>
    </footer>
  );
}

