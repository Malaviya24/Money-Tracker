import { useUser } from "@clerk/clerk-react";

export function useProfile() {
  const { user, isLoaded } = useUser();

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() || 'U';
  };

  const displayName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User';

  return {
    profile: user ? {
      first_name: user.firstName,
      last_name: user.lastName,
      avatar_url: user.imageUrl,
      default_currency: 'INR',
    } : null,
    isLoading: !isLoaded,
    getInitials,
    displayName,
    avatarUrl: user?.imageUrl,
  };
}
