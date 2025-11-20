import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDealershipSchema, updateDealershipSchema, insertCarSchema, updateCarSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dealership routes
  app.get("/api/dealerships", async (req, res) => {
    try {
      const dealerships = await storage.getAllDealerships();
      res.json(dealerships);
    } catch (error) {
      console.error("Error fetching dealerships:", error);
      res.status(500).json({ error: "Failed to fetch dealerships" });
    }
  });

  app.get("/api/dealerships/:id", async (req, res) => {
    try {
      const dealership = await storage.getDealership(req.params.id);
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      res.json(dealership);
    } catch (error) {
      console.error("Error fetching dealership:", error);
      res.status(500).json({ error: "Failed to fetch dealership" });
    }
  });

  app.post("/api/dealerships", async (req, res) => {
    try {
      const validated = insertDealershipSchema.parse(req.body);
      const dealership = await storage.createDealership(validated);
      res.status(201).json(dealership);
    } catch (error) {
      console.error("Error creating dealership:", error);
      res.status(400).json({ error: "Invalid dealership data" });
    }
  });

  app.patch("/api/dealerships/:id", async (req, res) => {
    try {
      const validated = updateDealershipSchema.parse(req.body);
      const dealership = await storage.updateDealership(req.params.id, validated);
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      res.json(dealership);
    } catch (error) {
      console.error("Error updating dealership:", error);
      res.status(400).json({ error: "Invalid dealership data" });
    }
  });

  app.delete("/api/dealerships/:id", async (req, res) => {
    try {
      const success = await storage.deleteDealership(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting dealership:", error);
      res.status(500).json({ error: "Failed to delete dealership" });
    }
  });

  // Car routes
  app.get("/api/cars", async (req, res) => {
    try {
      const dealershipId = req.query.dealershipId as string;
      const search = req.query.search as string;
      
      let cars;
      if (search) {
        cars = await storage.searchCars(search);
      } else if (dealershipId) {
        cars = await storage.getCarsByDealership(dealershipId);
      } else {
        cars = await storage.getAllCars();
      }
      
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ error: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const car = await storage.getCar(req.params.id);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({ error: "Failed to fetch car" });
    }
  });

  app.get("/api/cars/vin/:vin", async (req, res) => {
    try {
      const car = await storage.getCarByVin(req.params.vin);
      res.json(car || null);
    } catch (error) {
      console.error("Error fetching car by VIN:", error);
      res.status(500).json({ error: "Failed to fetch car" });
    }
  });

  app.post("/api/cars", async (req, res) => {
    try {
      const validated = insertCarSchema.parse(req.body);
      const car = await storage.createCar(validated);
      res.status(201).json(car);
    } catch (error) {
      console.error("Error creating car:", error);
      res.status(400).json({ error: "Invalid car data" });
    }
  });

  app.patch("/api/cars/:id", async (req, res) => {
    try {
      const validated = updateCarSchema.parse(req.body);
      const car = await storage.updateCar(req.params.id, validated);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      console.error("Error updating car:", error);
      res.status(400).json({ error: "Invalid car data" });
    }
  });

  app.delete("/api/cars/:id", async (req, res) => {
    try {
      const success = await storage.deleteCar(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting car:", error);
      res.status(500).json({ error: "Failed to delete car" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
