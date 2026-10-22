import InstagramIcon from "./InstagramIcon";

/**
 * The one and only Instagram link treatment. Used in the navbar strip
 * and the footer with a size variant — the two can never drift apart.
 * Handle, URL and accessible label arrive via props (single source).
 */
export default function InstagramLink({ handle, url, label, size = "md" }) {
  if (!url || !handle) return null;
  const small = size === "sm";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label || handle}
      className={`insta-text inline-flex items-center gap-2 font-bold transition-all duration-300 hover:brightness-125 ${
        small ? "text-xs normal-case tracking-normal" : "text-sm"
      }`}
    >
      <InstagramIcon size={small ? 17 : 16} gradient />
      <span>{handle}</span>
    </a>
  );
}
