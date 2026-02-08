interface FooterProps {
  title?: string;
}

export default function Footer({ title }: FooterProps) {
  return (
    <footer className="px-4 pb-12 relative max-w-7xl mx-auto w-full">
      <div className="shadow-xl bg-card/30 backdrop-blur-md p-10 rounded-[35px] border border-border text-center">
        <p className="text-item-title font-black text-[10px] uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} {title || "Digital Soul"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}