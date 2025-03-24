import { cn } from "@/lib/utils";
export const Heading = ({
  children,
  subTitle,
  className,
  ...props
}: React.ComponentProps<"h2"> & { subTitle: string }) => {
  return (
    <h2 className={cn("flex flex-col gap-2", className)} {...props}>
      <span
        className="text-2xl md:text-5xl font-bold uppercase"
        style={{ fontFamily: "var(--font-montserrat)" }}
        aria-hidden="true"
      >
        {subTitle}
      </span>
      <em className="text-base text-muted-foreground not-italic">{children}</em>
    </h2>
  );
};
