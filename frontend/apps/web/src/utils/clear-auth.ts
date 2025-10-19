// Utility function to clear authentication state
export function clearAuthState() {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage
  localStorage.removeItem('health_platform_token');
  localStorage.removeItem('health_platform_refresh_token');
  localStorage.removeItem('health_platform_user');
  localStorage.removeItem('auth-storage');
  
  // Clear sessionStorage as well
  sessionStorage.clear();
  
  console.log('🔧 Authentication state cleared');
}

// Auto-clear auth state on import (for development)
if (typeof window !== 'undefined' && window.location.search.includes('clear-auth')) {
  clearAuthState();
  // Remove the parameter from URL
  const url = new URL(window.location.href);
  url.searchParams.delete('clear-auth');
  window.history.replaceState({}, '', url.toString());
}
