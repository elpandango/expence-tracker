export interface User {
  userId?: string;
  name: string;
  lastName: string;
  email: string;
  avatar?: string;
  avatarVersion?: number;
  hasAvatar?: boolean;
}
