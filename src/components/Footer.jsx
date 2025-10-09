export default function Footer() {
  return (
    <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
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
          className="h-4 sm:h-5 w-auto opacity-25 group-hover:opacity-50 transition-opacity duration-300"
        />
      </a>
    </footer>
  );
}

