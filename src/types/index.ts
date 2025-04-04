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
    location: Location;
    host: User;
    status: string;
    isDraft: boolean;
    applicationsCount: number;
    createdAt: string;
    updatedAt: string;
    type?: string;
    budget?: { min: number; max: number };
    banner?: string;
    selectedArtist?: {
      fullName: string;
      profilePicture?: string;
    };
    subcategories?: string[];
    eventType?: string;
    reviewsCount?: number;
    pastEventsCount?: number;
  }

  export interface Location {
    lat: number;
    lng: number;
    address: string;
  }