import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dealership, Car, INITIAL_DEALERSHIPS } from './mock-data';
import { useToast } from '@/hooks/use-toast';

interface InventoryContextType {
  dealerships: Dealership[];
  addDealership: (dealership: Dealership) => void;
  updateDealership: (dealership: Dealership) => void;
  deleteDealership: (id: string) => void;
  addCar: (car: Car) => void;
  updateCar: (car: Car) => void;
  deleteCar: (dealershipId: string, carId: string) => void;
  toggleSoldStatus: (car: Car) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [dealerships, setDealerships] = useState<Dealership[]>(INITIAL_DEALERSHIPS);
  const { toast } = useToast();

  const addDealership = (dealership: Dealership) => {
    setDealerships([...dealerships, dealership]);
    toast({ title: "Success", description: "Dealership added successfully" });
  };

  const updateDealership = (dealership: Dealership) => {
    setDealerships(dealerships.map(d => d.id === dealership.id ? dealership : d));
    toast({ title: "Success", description: "Dealership updated" });
  };

  const deleteDealership = (id: string) => {
    setDealerships(dealerships.filter(d => d.id !== id));
    toast({ title: "Deleted", description: "Dealership removed" });
  };

  const addCar = (car: Car) => {
    setDealerships(dealerships.map(d => {
      if (d.id === car.dealershipId) {
        return { ...d, inventory: [...d.inventory, car] };
      }
      return d;
    }));
    toast({ title: "Success", description: "Car added to inventory" });
  };

  const updateCar = (car: Car) => {
    setDealerships(dealerships.map(d => {
      if (d.id === car.dealershipId) {
        return {
          ...d,
          inventory: d.inventory.map(c => c.id === car.id ? car : c)
        };
      }
      return d;
    }));
    toast({ title: "Success", description: "Car updated" });
  };

  const deleteCar = (dealershipId: string, carId: string) => {
    setDealerships(dealerships.map(d => {
      if (d.id === dealershipId) {
        return { ...d, inventory: d.inventory.filter(c => c.id !== carId) };
      }
      return d;
    }));
    toast({ title: "Deleted", description: "Car removed from inventory" });
  };

  const toggleSoldStatus = (car: Car) => {
    const newStatus = car.status === 'sold' ? 'available' : 'sold';
    const updatedCar = { ...car, status: newStatus };
    
    setDealerships(dealerships.map(d => {
        if (d.id === car.dealershipId) {
            return {
                ...d,
                inventory: d.inventory.map(c => c.id === car.id ? updatedCar : c)
            };
        }
        return d;
    }));
    
    toast({ 
        title: newStatus === 'sold' ? "Marked as Sold" : "Marked as Available", 
        description: `${car.year} ${car.make} ${car.model} is now ${newStatus}.` 
    });
  };

  return (
    <InventoryContext.Provider value={{
      dealerships,
      addDealership,
      updateDealership,
      deleteDealership,
      addCar,
      updateCar,
      deleteCar,
      toggleSoldStatus
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
