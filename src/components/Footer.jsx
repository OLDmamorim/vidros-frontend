import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  
  // Usar versão branca na página de login (fundo colorido), preta nas outras (fundo branco)
  const isLoginPage = location.pathname === '/login';
  const logoSrc = isLoginPage ? '/turned_real_white.png' : '/turned_real_black.png';
  
  return (
    <footer className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 pointer-events-none">
      <a 
        href="https://nexai.pt" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block opacity-30 hover:opacity-60 transition-opacity duration-300 pointer-events-auto"
        title="Developed by NEXAI"
      >
        <img 
          src={logoSrc}
          alt="turned_real by NEXAI" 
          className="h-5 sm:h-7 w-auto"
        />
      </a>
    </footer>
  );
}

