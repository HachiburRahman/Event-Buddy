// frontend/src/types/index.ts

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: string; 
  location: string;
  capacity: number;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;

  bookedSeats: number;
  spotsLeft: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface IBooking {
  id: string;
  numberOfSeats: number;
  createdAt: string;
  userId: string;
  eventId: string;
  event: IEvent; 
}