interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Avatar component with initials or image
 */
export default function Avatar({
  name = "User",
  imageUrl,
  size = "md",
  className = "",
}: AvatarProps): JSX.Element {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0]?.[0]?.toUpperCase() || "U";
    return (
      (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
    ).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md overflow-hidden ${className}`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
