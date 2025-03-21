export interface User {
    id: string;
    phoneNumber: string;
    username: string;
    fullName: string;
    displayName: string;
    isArtist: boolean;
    bio?: string;
    portfolio?: { type: string; url: string }[];
    socialLinks?: { [key: string]: string };
    categories?: string[];
    subCategories?: string[];
  }
  
  export interface Event {
    id: string;
    title: string;
    category: string;
    dateTime: string;
    location: string;
    host: User;
    status: string;
  }