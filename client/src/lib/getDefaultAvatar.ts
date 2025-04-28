/**
 * Generates default avatar colors and initial letters based on name
 * Inspired by WhatsApp's color selection for default avatars
 */

// WhatsApp-style color palette for default avatars
const avatarColors = [
  "#00A884", // Primary teal
  "#25D366", // WhatsApp green
  "#34B7F1", // WhatsApp blue
  "#F15C6D", // Pink
  "#8378FF", // Purple
  "#FF8C2E", // Orange
  "#008069", // Dark teal
  "#775FE8", // Light purple
];

/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "GA";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "GA";
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get a consistent color for a specific name
 */
export function getAvatarColor(name: string | null | undefined): string {
  if (!name) return avatarColors[0];
  
  // Use a simple hash for the name to get a consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Get a color from our palette
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}

/**
 * Generate an SVG data URI for a default avatar
 */
export function getDefaultAvatarUri(name: string | null | undefined): string {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${color}" />
      <text 
        x="50" 
        y="50" 
        dy=".35em"
        fill="white" 
        font-family="Arial, sans-serif" 
        font-size="40" 
        font-weight="bold" 
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${initials}
      </text>
    </svg>
  `;
  
  // Convert to a data URI
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default getDefaultAvatarUri;