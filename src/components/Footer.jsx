export default function Footer() {
  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <a 
        href="https://nexai.pt" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block pointer-events-auto group"
        title="Developed by NEXAI"
      >
        <img 
          src="/turned_real_white.png"
          alt="turned_real by NEXAI" 
          className="h-6 sm:h-8 md:h-10 w-auto opacity-50 group-hover:opacity-80 transition-opacity duration-300"
        />
      </a>
    </footer>
  );
}

