/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
}

/**
 * Get a consistent color for a specific name
 */
export function getAvatarColor(name: string | null | undefined): string {
  if (!name) return "#00a884"; // Default WhatsApp green
  
  // WhatsApp-like colors
  const colors = [
    "#00a884", // WhatsApp green
    "#128c7e", // Dark green
    "#25d366", // Light green
    "#075e54", // Deep green
    "#34b7f1", // Light blue
    "#01bfa5", // Teal
  ];
  
  // Generate a hash from the name to get a consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to an index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Generate an SVG data URI for a default avatar
 */
export default function getDefaultAvatarUri(name: string | null | undefined): string {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  
  // Create the SVG for the avatar
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${bgColor}" />
      <text x="50" y="50" 
        font-family="Arial, sans-serif" 
        font-size="40" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central"
        letter-spacing="-1px">
        ${initials}
      </text>
    </svg>
  `;
  
  // Convert the SVG to a data URI
  const encoded = encodeURIComponent(svg.trim())
    .replace(/%20/g, ' ')
    .replace(/%3D/g, '=')
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/')
    .replace(/%22/g, "'");
    
  return `data:image/svg+xml;utf8,${encoded}`;
}