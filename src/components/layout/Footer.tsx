export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-0 px-4">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Yasuna A. Portfolio Site, All rights reserved.
        </p>
      </div>
    </footer>
  );
}
