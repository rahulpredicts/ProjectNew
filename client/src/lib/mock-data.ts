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

export const INITIAL_DEALERSHIPS: Dealership[] = [
  {
    id: '1',
    name: 'Montreal Auto Gallery',
    location: 'Montreal, QC',
    address: '1234 St-Laurent Blvd',
    postalCode: 'H2X 2S6',
    phone: '514-555-0123',
    inventory: [
      {
        id: 'c1',
        vin: '2T1BURHE5MC39284',
        make: 'Toyota',
        model: 'RAV4',
        trim: 'LE AWD',
        year: '2021',
        color: 'Magnetic Gray',
        price: '28995',
        kilometers: '45000',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        bodyType: 'SUV',
        listingLink: '',
        carfaxLink: '',
        notes: 'One owner, clean Carfax',
        dealershipId: '1'
      },
      {
        id: 'c2',
        vin: '1HGCR2F58LA123456',
        make: 'Honda',
        model: 'Civic',
        trim: 'Sport',
        year: '2022',
        color: 'Rallye Red',
        price: '26500',
        kilometers: '22000',
        transmission: 'CVT',
        fuelType: 'Gasoline',
        bodyType: 'Sedan',
        listingLink: '',
        carfaxLink: '',
        notes: 'Winter tires included',
        dealershipId: '1'
      }
    ]
  },
  {
    id: '2',
    name: 'Toronto Luxury Cars',
    location: 'Toronto, ON',
    address: '555 Queen St W',
    postalCode: 'M5V 2B5',
    phone: '416-555-9876',
    inventory: [
      {
        id: 'c3',
        vin: 'WBA33AE050F123456',
        make: 'BMW',
        model: '330i',
        trim: 'xDrive',
        year: '2023',
        color: 'Alpine White',
        price: '52000',
        kilometers: '12000',
        transmission: 'Automatic',
        fuelType: 'Premium Gas',
        bodyType: 'Sedan',
        listingLink: '',
        carfaxLink: '',
        notes: 'Demo vehicle, low mileage',
        dealershipId: '2'
      }
    ]
  },
  {
    id: '3',
    name: 'Vancouver EV Center',
    location: 'Vancouver, BC',
    address: '789 Broadway',
    postalCode: 'V5Z 1T1',
    phone: '604-555-4567',
    inventory: [
      {
        id: 'c4',
        vin: '5YJ3E1EB0KF123456',
        make: 'Tesla',
        model: 'Model 3',
        trim: 'Long Range',
        year: '2022',
        color: 'Deep Blue Metallic',
        price: '48000',
        kilometers: '35000',
        transmission: 'Automatic',
        fuelType: 'Electric',
        bodyType: 'Sedan',
        listingLink: '',
        carfaxLink: '',
        notes: 'Full Self-Driving included',
        dealershipId: '3'
      }
    ]
  }
];
