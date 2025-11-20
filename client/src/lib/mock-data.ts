export interface Car {
  id: string;
  vin: string;
  make: string;
  model: string;
  trim: string;
  year: string;
  color: string;
  price: string;
  kilometers: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  listingLink: string;
  carfaxLink: string;
  notes: string;
  dealershipId?: string;
  dealershipName?: string;
  dealershipLocation?: string;
  status: 'available' | 'sold';
}

export interface Dealership {
  id: string;
  name: string;
  location: string;
  address: string;
  postalCode: string;
  phone: string;
  inventory: Car[];
}

export const INITIAL_DEALERSHIPS: Dealership[] = [];
