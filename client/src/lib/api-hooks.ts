import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Types based on database schema
export interface Dealership {
  id: string;
  name: string;
  location: string;
  province: string;
  address: string;
  postalCode: string;
  phone: string;
  createdAt?: string;
}

export interface Car {
  id: string;
  dealershipId: string;
  dealerName: string;
  vin: string;
  stockNumber?: string;
  condition: string;
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
  drivetrain?: string;
  engineCylinders?: string;
  engineDisplacement?: string;
  features?: string[];
  listingLink: string;
  carfaxLink: string;
  carfaxStatus?: 'clean' | 'claims' | 'unavailable';
  notes: string;
  status: 'available' | 'sold' | 'pending';
  createdAt?: string;
}

// API functions
async function fetchDealerships(): Promise<Dealership[]> {
  const response = await fetch('/api/dealerships');
  if (!response.ok) throw new Error('Failed to fetch dealerships');
  return response.json();
}

async function fetchCars(dealershipId?: string, search?: string): Promise<Car[]> {
  const params = new URLSearchParams();
  if (dealershipId) params.append('dealershipId', dealershipId);
  if (search) params.append('search', search);
  
  const response = await fetch(`/api/cars?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch cars');
  return response.json();
}

async function fetchCarByVin(vin: string): Promise<Car | null> {
  const response = await fetch(`/api/cars/vin/${vin}`);
  if (!response.ok) throw new Error('Failed to fetch car');
  return response.json();
}

async function fetchCarByStockNumber(stockNumber: string): Promise<Car | null> {
  const response = await fetch(`/api/cars/stock/${stockNumber}`);
  if (!response.ok) throw new Error('Failed to fetch car');
  return response.json();
}

async function createDealership(dealership: Omit<Dealership, 'id' | 'createdAt'>): Promise<Dealership> {
  const response = await fetch('/api/dealerships', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dealership),
  });
  if (!response.ok) throw new Error('Failed to create dealership');
  return response.json();
}

async function updateDealership(id: string, dealership: Partial<Dealership>): Promise<Dealership> {
  const response = await fetch(`/api/dealerships/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dealership),
  });
  if (!response.ok) throw new Error('Failed to update dealership');
  return response.json();
}

async function deleteDealership(id: string): Promise<void> {
  const response = await fetch(`/api/dealerships/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete dealership');
}

async function createCar(car: Omit<Car, 'id' | 'createdAt'>): Promise<Car> {
  const response = await fetch('/api/cars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
  if (!response.ok) throw new Error('Failed to create car');
  return response.json();
}

async function updateCar(id: string, car: Partial<Car>): Promise<Car> {
  const response = await fetch(`/api/cars/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  });
  if (!response.ok) throw new Error('Failed to update car');
  return response.json();
}

async function deleteCar(id: string): Promise<void> {
  const response = await fetch(`/api/cars/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete car');
}

// React Query hooks
export function useDealerships() {
  return useQuery({
    queryKey: ['dealerships'],
    queryFn: fetchDealerships,
  });
}

export function useCars(dealershipId?: string, search?: string) {
  return useQuery({
    queryKey: ['cars', dealershipId, search],
    queryFn: () => fetchCars(dealershipId, search),
  });
}

export function useCarByVin(vin: string) {
  return useQuery({
    queryKey: ['car-vin', vin],
    queryFn: () => fetchCarByVin(vin),
    enabled: vin.length > 0,
  });
}

export function useCreateDealership() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createDealership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerships'] });
      toast({ title: "Success", description: "Dealership added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add dealership", variant: "destructive" });
    },
  });
}

export function useUpdateDealership() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dealership> }) => updateDealership(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerships'] });
      toast({ title: "Success", description: "Dealership updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update dealership", variant: "destructive" });
    },
  });
}

export function useDeleteDealership() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteDealership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerships'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ title: "Deleted", description: "Dealership removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete dealership", variant: "destructive" });
    },
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ title: "Success", description: "Car added to inventory" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add car", variant: "destructive" });
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Car> }) => updateCar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ title: "Success", description: "Car updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update car", variant: "destructive" });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ title: "Deleted", description: "Car removed from inventory" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete car", variant: "destructive" });
    },
  });
}

export function useToggleSoldStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (car: Car) => {
      const newStatus: 'available' | 'sold' = car.status === 'sold' ? 'available' : 'sold';
      return updateCar(car.id, { status: newStatus });
    },
    onSuccess: (updatedCar) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ 
        title: updatedCar.status === 'sold' ? "Marked as Sold" : "Marked as Available", 
        description: `${updatedCar.year} ${updatedCar.make} ${updatedCar.model} is now ${updatedCar.status}.` 
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update car status", variant: "destructive" });
    },
  });
}
