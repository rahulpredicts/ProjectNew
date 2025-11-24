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

  app.get("/api/cars/stock/:stockNumber", async (req, res) => {
    try {
      const car = await storage.getCarByStockNumber(req.params.stockNumber);
      res.json(car || null);
    } catch (error) {
      console.error("Error fetching car by stock number:", error);
      res.status(500).json({ error: "Failed to fetch car" });
    }
  });

  app.post("/api/cars", async (req, res) => {
    try {
      const validated = insertCarSchema.parse(req.body);
      
      if (validated.vin) {
        const existingCar = await storage.getCarByVin(validated.vin);
        if (existingCar) {
          return res.status(409).json({ error: "A vehicle with this VIN already exists" });
        }
      }

      if (validated.stockNumber) {
        const existingCar = await storage.getCarByStockNumber(validated.stockNumber);
        if (existingCar) {
          return res.status(409).json({ error: "A vehicle with this Stock Number already exists" });
        }
      }
      
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
      
      // Ensure at least VIN or Stock Number is provided
      const hasVin = validated.vin && validated.vin.trim() !== '';
      const hasStockNumber = validated.stockNumber && validated.stockNumber.trim() !== '';
      if (!hasVin && !hasStockNumber) {
        return res.status(400).json({ error: "At least one of VIN or Stock Number must be provided" });
      }
      
      if (validated.vin) {
        const existingCar = await storage.getCarByVin(validated.vin);
        if (existingCar && existingCar.id !== req.params.id) {
          return res.status(409).json({ error: "A vehicle with this VIN already exists" });
        }
      }

      if (validated.stockNumber) {
        const existingCar = await storage.getCarByStockNumber(validated.stockNumber);
        if (existingCar && existingCar.id !== req.params.id) {
          return res.status(409).json({ error: "A vehicle with this Stock Number already exists" });
        }
      }
      
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

  // Scrape vehicle listing URL
  app.post("/api/scrape-listing", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const response = await fetch(url);
      if (!response.ok) {
        return res.status(400).json({ error: "Failed to fetch URL" });
      }

      const html = await response.text();
      const extracted: any = {};

      // Extract Year - check URL first, then headings, then generic (get full 4-digit year)
      let yearMatch = url.match(/(19|20)\d{2}/);
      if (!yearMatch) yearMatch = html.match(/<h[1-6][^>]*>\s*(19|20)\d{2}\s+[A-Z]/i); // Year at start of heading
      if (!yearMatch) yearMatch = html.match(/(19|20)\d{2}\s+(?:Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Dodge|Ferrari|Fiat|Ford|Genesis|GMC|Honda|Hyundai|Infiniti|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Maserati|Mazda|McLaren|Mercedes-Benz|MINI|Mitsubishi|Nissan|Porsche|Ram|Rolls-Royce|Subaru|Tesla|Toyota|Volkswagen|Volvo)/i);
      if (!yearMatch) yearMatch = html.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) extracted.year = yearMatch[0]; // yearMatch[0] is the full 4-digit year

      // Extract VIN (17 characters, uppercase letters and numbers)
      const vinMatch = html.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
      if (vinMatch) extracted.vin = vinMatch[0].toUpperCase();

      // Extract Price - prioritize selling price, red color indicators, or prominent prices
      let priceMatch = html.match(/[Ss]elling\s*[Pp]rice[\s:]?\$[\s]?([\d,]+(?:\.\d{2})?)/);
      if (!priceMatch) priceMatch = html.match(/(?:Selling|Sale|Final|Current)?\s*(?:Price|Amount)[\s:]?\$[\s]?([\d,]+(?:\.\d{2})?)/i);
      if (!priceMatch) priceMatch = html.match(/color\s*[:=]\s*["']?red["']?[^>]*>[^<]*\$[\s]?([\d,]+(?:\.\d{2})?)/i);
      if (!priceMatch) priceMatch = html.match(/style\s*=\s*["'][^"']*color\s*:\s*red[^"']*["'][^>]*>[^<]*\$[\s]?([\d,]+(?:\.\d{2})?)/i);
      if (!priceMatch) priceMatch = html.match(/<strong>[^<]*\$[\s]?([\d,]+(?:\.\d{2})?)[^<]*<\/strong>/i);
      if (!priceMatch) priceMatch = html.match(/\$[\s]?([\d,]{3,}(?:\.\d{2})?)/); // Larger amounts (more likely selling price)
      if (priceMatch) extracted.price = priceMatch[1].replace(/,/g, "");

      // Extract Mileage/Kilometers - prioritize odometer and larger numbers
      let kmsMatch = html.match(/[Oo]dometer[\s:]+([\d,]+)\s*(?:km|kilometers|miles|mi)/i);
      if (!kmsMatch) kmsMatch = html.match(/[Mm]ileage[\s:]+([\d,]+)\s*(?:km|kilometers|miles|mi)/i);
      if (!kmsMatch) kmsMatch = html.match(/([\d,]{4,})\s*(?:km|kilometers)\b/i); // Look for larger km values
      if (!kmsMatch) kmsMatch = html.match(/(\d+(?:,\d+)?)\s*(?:km|kilometers|miles|mi)\b/i);
      if (kmsMatch) extracted.kilometers = kmsMatch[1].replace(/,/g, "");

      // Extract Stock Number - try multiple patterns
      let stockMatch = html.match(/Stock\s*#\s*:\s*([A-Za-z0-9\-_]+)/i); // Stock #: W0095 format
      if (!stockMatch) stockMatch = html.match(/#\s*([A-Za-z0-9\-_]+)\b/); // Hash prefix pattern like #26102B
      if (!stockMatch) stockMatch = html.match(/Stock\s*(?:Number|#|:)?\s*[:=]?\s*([A-Za-z0-9\-_]+)/i);
      if (!stockMatch) stockMatch = html.match(/SKU\s*[:=]?\s*([A-Za-z0-9\-_]+)/i);
      if (!stockMatch) stockMatch = html.match(/Stock\s*([A-Za-z0-9\-_]+)/i);
      if (!stockMatch) stockMatch = html.match(/>([A-Z0-9]{4,10})<\/.*>.*?(?:Stock|SKU)/i);
      if (stockMatch) extracted.stockNumber = stockMatch[1].trim();

      // Extract Color
      const colorMatch = html.match(/(Black|White|Silver|Gray|Red|Blue|Brown|Green|Beige|Gold|Orange|Yellow|Purple|Charcoal|Burgundy|Maroon|Navy|Teal|Cyan|Lime|Pearl)/i);
      if (colorMatch) extracted.color = colorMatch[0];

      // Extract common Make/Model patterns
      const makeModelMatch = html.match(/(Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Dodge|Ferrari|Fiat|Ford|Genesis|GMC|Honda|Hyundai|Infiniti|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Maserati|Mazda|McLaren|Mercedes-Benz|MINI|Mitsubishi|Nissan|Porsche|Ram|Rolls-Royce|Subaru|Tesla|Toyota|Volkswagen|Volvo)\s+([A-Za-z0-9\s\-]+)(?:\s|,|<)/i);
      if (makeModelMatch) {
        extracted.make = makeModelMatch[1];
        extracted.model = makeModelMatch[2]?.trim();
      }

      res.json(extracted);
    } catch (error) {
      console.error("Error scraping listing:", error);
      res.status(500).json({ error: "Failed to scrape listing URL" });
    }
  });

  // ScrapingDog API endpoint - uses JavaScript rendering for better extraction
  app.post("/api/scrape-listing-scrapingdog", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const apiKey = process.env.SCRAPINGDOG_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "ScrapingDog API key not configured" });
      }

      // Call ScrapingDog API with JavaScript rendering enabled
      const scrapingDogUrl = `https://api.scrapingdog.com/scrape?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true`;
      
      const response = await fetch(scrapingDogUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ScrapingDog error:", errorText);
        return res.status(400).json({ error: "Failed to scrape with ScrapingDog" });
      }

      const html = await response.text();
      const extracted: any = {};

      // Extract Year
      let yearMatch = url.match(/(19|20)\d{2}/);
      if (!yearMatch) yearMatch = html.match(/<h[1-6][^>]*>\s*(19|20)\d{2}\s+[A-Z]/i);
      if (!yearMatch) yearMatch = html.match(/(19|20)\d{2}\s+(?:Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Dodge|Ferrari|Fiat|Ford|Genesis|GMC|Honda|Hyundai|Infiniti|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Maserati|Mazda|McLaren|Mercedes-Benz|MINI|Mitsubishi|Nissan|Porsche|Ram|Rolls-Royce|Subaru|Tesla|Toyota|Volkswagen|Volvo)/i);
      if (!yearMatch) yearMatch = html.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) extracted.year = yearMatch[0];

      // Extract VIN
      const vinMatch = html.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
      if (vinMatch) extracted.vin = vinMatch[0].toUpperCase();

      // Extract Price
      let priceMatch = html.match(/[Ss]elling\s*[Pp]rice[\s:]?\$[\s]?([\d,]+(?:\.\d{2})?)/);
      if (!priceMatch) priceMatch = html.match(/(?:Selling|Sale|Final|Current)?\s*(?:Price|Amount)[\s:]?\$[\s]?([\d,]+(?:\.\d{2})?)/i);
      if (!priceMatch) priceMatch = html.match(/\$[\s]?([\d,]{3,}(?:\.\d{2})?)/);
      if (priceMatch) extracted.price = priceMatch[1].replace(/,/g, "");

      // Extract Kilometers
      let kmsMatch = html.match(/[Oo]dometer[\s:]+([\d,]+)\s*(?:km|kilometers|miles|mi)/i);
      if (!kmsMatch) kmsMatch = html.match(/[Mm]ileage[\s:]+([\d,]+)\s*(?:km|kilometers|miles|mi)/i);
      if (!kmsMatch) kmsMatch = html.match(/([\d,]{4,})\s*(?:km|kilometers)\b/i);
      if (kmsMatch) extracted.kilometers = kmsMatch[1].replace(/,/g, "");

      // Extract Stock Number
      let stockMatch = html.match(/Stock\s*#\s*:\s*([A-Za-z0-9\-_]+)/i);
      if (!stockMatch) stockMatch = html.match(/Stock\s*(?:Number|#|:)?\s*[:=]?\s*([A-Za-z0-9\-_]+)/i);
      if (!stockMatch) stockMatch = html.match(/SKU\s*[:=]?\s*([A-Za-z0-9\-_]+)/i);
      if (stockMatch) extracted.stockNumber = stockMatch[1].trim();

      // Extract Color
      const colorMatch = html.match(/(Black|White|Silver|Gray|Red|Blue|Brown|Green|Beige|Gold|Orange|Yellow|Purple|Charcoal|Burgundy|Maroon|Navy|Teal|Cyan|Lime|Pearl)/i);
      if (colorMatch) extracted.color = colorMatch[0];

      // Extract Make/Model
      const makeModelMatch = html.match(/(Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Dodge|Ferrari|Fiat|Ford|Genesis|GMC|Honda|Hyundai|Infiniti|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Maserati|Mazda|McLaren|Mercedes-Benz|MINI|Mitsubishi|Nissan|Porsche|Ram|Rolls-Royce|Subaru|Tesla|Toyota|Volkswagen|Volvo)\s+([A-Za-z0-9\s\-]+)(?:\s|,|<)/i);
      if (makeModelMatch) {
        extracted.make = makeModelMatch[1];
        extracted.model = makeModelMatch[2]?.trim();
      }

      res.json({ extracted, rawHtml: html.substring(0, 5000) }); // Include snippet of raw HTML
    } catch (error) {
      console.error("Error with ScrapingDog:", error);
      res.status(500).json({ error: "Failed to scrape with ScrapingDog service" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
