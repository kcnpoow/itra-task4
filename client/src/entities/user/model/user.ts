export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  lastSeenAt: number;
  isBlocked: boolean;
  isVerified: boolean;
}
