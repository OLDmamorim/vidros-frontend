export default function Footer() {
  return (
    <footer className="w-full py-6 flex justify-center items-center">
      <a 
        href="https://nexai.pt" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group"
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

