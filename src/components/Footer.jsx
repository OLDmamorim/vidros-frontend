import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  
  // Usar logo preto em páginas com fundo claro (login tem fundo escuro)
  const isLoginPage = location.pathname === '/login';
  const logoSrc = isLoginPage ? '/turned_real_white.png' : '/turned_real_black.png';
  
  return (
    <footer className="w-full py-6 flex justify-center items-center bg-transparent">
      <a 
        href="https://nexai.pt" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group"
        title="Developed by NEXAI"
      >
        <img 
          src={logoSrc}
          alt="turned_real by NEXAI" 
          className="h-6 sm:h-8 md:h-10 w-auto opacity-40 group-hover:opacity-70 transition-opacity duration-300"
        />
      </a>
    </footer>
  );
}

