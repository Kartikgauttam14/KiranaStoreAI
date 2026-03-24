export interface Store {
  id: string;
  ownerId: string;
  name: string;
  bannerImage?: string;
  gstNumber?: string;
  fssaiNumber?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  pincode: string;
  deliveryRadius: number;
  minOrderValue: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  isActive: boolean;
  isApproved: boolean;
  rating: number;
  totalRatings: number;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreRequest {
  name: string;
  gstNumber?: string;
  fssaiNumber?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  pincode: string;
  deliveryRadius?: number;
  minOrderValue?: number;
  openTime?: string;
  closeTime?: string;
}

export interface UpdateStoreRequest extends Partial<CreateStoreRequest> {}

export interface NearbyStoresRequest {
  lat: number;
  lng: number;
  radius?: number;
}
