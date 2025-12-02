import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDealershipSchema, updateDealershipSchema, insertCarSchema, updateCarSchema, createUserSchema, updateUserSchema } from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";
import { setupAuth, isAuthenticated } from "./replitAuth";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Helper function to sanitize user data - removes sensitive fields
  const sanitizeUser = (user: any) => {
    if (!user) return user;
    const { passwordHash, passwordResetToken, passwordResetExpiry, ...safeUser } = user;
    return safeUser;
  };

  // Password-based login endpoint
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.authType !== 'password' || !user.passwordHash) {
        return res.status(401).json({ message: "This account uses OAuth login. Please use the Replit login button." });
      }

      if (user.isActive !== 'true') {
        return res.status(401).json({ message: "Account is disabled. Please contact an administrator." });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session for password-based user
      req.session.userId = user.id;
      req.session.authType = 'password';
      
      // Update last login
      await storage.updateUser(user.id, {});
      
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Auth routes - now supports both OAuth and password sessions
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for password-based session first
      if (req.session?.userId && req.session?.authType === 'password') {
        const user = await storage.getUser(req.session.userId);
        if (user && user.isActive === 'true') {
          return res.json(sanitizeUser(user));
        }
      }
      
      // Check for OAuth session
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(sanitizeUser(user));
      }
      
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Helper to get current user ID from either session type
  const getCurrentUserId = (req: any): string | null => {
    if (req.session?.userId && req.session?.authType === 'password') {
      return req.session.userId;
    }
    if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
      return req.user.claims.sub;
    }
    return null;
  };

  // Middleware to check authentication for both session types
  const isAuthenticatedAny = async (req: any, res: any, next: any) => {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.currentUserId = userId;
    next();
  };

  // Admin-only route to get all users
  app.get('/api/admin/users', isAuthenticatedAny, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.currentUserId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const users = await storage.getAllUsers();
      // Sanitize all users to remove sensitive fields
      res.json(users.map(sanitizeUser));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin-only route to update user role
  app.patch('/api/admin/users/:id/role', isAuthenticatedAny, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.currentUserId);
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { role } = req.body;
      if (!['admin', 'dealer', 'data_analyst'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const updatedUser = await storage.updateUserRole(req.params.id, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(updatedUser));
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Admin-only route to create a new user with password
  app.post('/api/admin/users', isAuthenticatedAny, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.currentUserId);
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validated = createUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validated.email);
      if (existingUser) {
        return res.status(409).json({ message: "A user with this email already exists" });
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(validated.password, saltRounds);

      const newUser = await storage.createPasswordUser(validated, passwordHash);
      
      res.status(201).json(sanitizeUser(newUser));
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Admin-only route to update a user
  app.patch('/api/admin/users/:id', isAuthenticatedAny, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.currentUserId);
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validated = updateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.params.id, validated);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(sanitizeUser(updatedUser));
    } catch (error: any) {
      console.error("Error updating user:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Admin-only route to reset user password
  app.post('/api/admin/users/:id/reset-password', isAuthenticatedAny, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.currentUserId);
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash the new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      const updatedUser = await storage.updateUserPassword(req.params.id, passwordHash);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Admin-only route to delete a user
  app.delete('/api/admin/users/:id', isAuthenticatedAny, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.currentUserId);
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Prevent deleting yourself
      if (req.params.id === req.currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

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

  // Dealership car counts - must be before :id route
  app.get("/api/dealerships/car-counts", async (req, res) => {
    try {
      const counts = await storage.getCarCountsByDealership();
      res.json(counts);
    } catch (error) {
      console.error("Error fetching dealership car counts:", error);
      res.status(500).json({ error: "Failed to fetch dealership car counts" });
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
      
      const existingDealership = await storage.getDealershipByName(validated.name);
      
      if (existingDealership) {
        return res.status(409).json({ 
          error: "Dealership already exists", 
          message: `A dealership named "${existingDealership.name}" already exists. Please use a different name.` 
        });
      }
      
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

  // Car routes - paginated endpoint (primary)
  app.get("/api/cars/paginated", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize as string) || 50, 10000);
      
      // Parse all filter parameters (including sorting across all data)
      const filters = {
        dealershipId: req.query.dealershipId as string || undefined,
        search: req.query.search as string || undefined,
        status: req.query.status as string || undefined,
        make: req.query.make as string || undefined,
        model: req.query.model as string || undefined,
        vin: req.query.vin as string || undefined,
        vinStart: req.query.vinStart as string || undefined,
        color: req.query.color as string || undefined,
        trim: req.query.trim as string || undefined,
        yearMin: req.query.yearMin ? parseInt(req.query.yearMin as string) : undefined,
        yearMax: req.query.yearMax ? parseInt(req.query.yearMax as string) : undefined,
        priceMin: req.query.priceMin ? parseInt(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseInt(req.query.priceMax as string) : undefined,
        kmsMin: req.query.kmsMin ? parseInt(req.query.kmsMin as string) : undefined,
        kmsMax: req.query.kmsMax ? parseInt(req.query.kmsMax as string) : undefined,
        province: req.query.province as string || undefined,
        transmission: req.query.transmission ? (req.query.transmission as string).split(',').filter(Boolean) : undefined,
        drivetrain: req.query.drivetrain ? (req.query.drivetrain as string).split(',').filter(Boolean) : undefined,
        fuelType: req.query.fuelType ? (req.query.fuelType as string).split(',').filter(Boolean) : undefined,
        bodyType: req.query.bodyType ? (req.query.bodyType as string).split(',').filter(Boolean) : undefined,
        engineCylinders: req.query.engineCylinders ? (req.query.engineCylinders as string).split(',').filter(Boolean) : undefined,
        sortBy: req.query.sortBy as string || undefined,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || undefined,
      };
      
      const result = await storage.getCarsPaginated({ page, pageSize }, filters);
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching cars (paginated):", error);
      res.status(500).json({ error: "Failed to fetch cars" });
    }
  });

  // Car counts endpoint for quick stats
  app.get("/api/cars/counts", async (req, res) => {
    try {
      const dealershipId = req.query.dealershipId as string;
      const counts = await storage.getCarsCount(dealershipId || undefined);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching car counts:", error);
      res.status(500).json({ error: "Failed to fetch car counts" });
    }
  });

  // Legacy endpoint - still available for backwards compatibility
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
      const errorMsg = error instanceof Error ? error.message : 'Invalid car data';
      res.status(400).json({ error: errorMsg });
    }
  });

  // Bulk CSV import endpoint - more lenient validation
  app.post("/api/cars/bulk-import", async (req, res) => {
    try {
      const cars = req.body.cars || [];
      const dealershipId = req.body.dealershipId;

      if (!dealershipId) {
        return res.status(400).json({ error: "Dealership ID is required" });
      }

      if (!Array.isArray(cars) || cars.length === 0) {
        return res.status(400).json({ error: "No cars provided" });
      }

      const results = [];
      for (const car of cars) {
        try {
          // Provide defaults for required fields
          const carData = {
            dealershipId: dealershipId,
            vin: car.vin || "",
            stockNumber: car.stockNumber || "",
            condition: car.condition || "used",
            make: car.make || "Unknown",
            model: car.model || "Unknown",
            trim: car.trim || "",
            year: car.year || "",
            color: car.color || "",
            price: car.price || "0",
            kilometers: car.kilometers || "0",
            transmission: car.transmission || "",
            fuelType: car.fuelType || "",
            bodyType: car.bodyType || "",
            drivetrain: car.drivetrain || "fwd",
            engineCylinders: car.engineCylinders || "",
            engineDisplacement: car.engineDisplacement || "",
            features: car.features || [],
            listingLink: car.listingLink || "",
            carfaxLink: car.carfaxLink || "",
            carfaxStatus: car.carfaxStatus || "unavailable",
            notes: car.notes || "",
            status: 'available'
          };

          const validated = insertCarSchema.parse(carData);
          
          // Check for duplicates only if VIN is provided and non-empty
          if (validated.vin && validated.vin.trim() !== "") {
            const existingCar = await storage.getCarByVin(validated.vin);
            if (existingCar) {
              results.push({
                car: `${carData.year} ${carData.make} ${carData.model}`,
                success: false,
                error: "VIN already exists"
              });
              continue;
            }
          }

          // Check for duplicates only if stock number is provided and non-empty
          if (validated.stockNumber && validated.stockNumber.trim() !== "") {
            const existingCar = await storage.getCarByStockNumber(validated.stockNumber);
            if (existingCar) {
              results.push({
                car: `${carData.year} ${carData.make} ${carData.model}`,
                success: false,
                error: "Stock number already exists"
              });
              continue;
            }
          }

          const createdCar = await storage.createCar(validated);
          results.push({
            car: `${carData.year} ${carData.make} ${carData.model}`,
            success: true,
            id: createdCar.id
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            car: `${car.year || ''} ${car.make || 'Unknown'} ${car.model || ''}`.trim(),
            success: false,
            error: errorMsg
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      res.json({
        totalProcessed: cars.length,
        successCount,
        failureCount,
        results
      });
    } catch (error) {
      console.error("Error in bulk import:", error);
      const errorMsg = error instanceof Error ? error.message : 'Bulk import failed';
      res.status(400).json({ error: errorMsg });
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

  // Test endpoint - directly test ScrapingDog API
  app.post("/api/test-scrapingdog-direct", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const apiKey = process.env.SCRAPINGDOG_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "ScrapingDog API key not configured" });
      }

      console.log("Testing ScrapingDog API with dynamic=false");
      const scrapingDogUrl = `https://api.scrapingdog.com/scrape?api_key=${apiKey}&url=${encodeURIComponent(url)}&dynamic=false`;
      
      const response = await fetch(scrapingDogUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      const html = await response.text();
      const status = response.status;
      const ok = response.ok;

      // Return raw HTML and metadata for inspection
      const preview = html.substring(0, 2000);
      const htmlLength = html.length;
      
      // Try to extract cars anyway
      const cars: any[] = [];
      
      // Extract VINs
      const vinRegex = /\b([A-HJ-NPR-Z0-9]{17})\b/gi;
      const vins = new Set<string>();
      let vinMatch;
      while ((vinMatch = vinRegex.exec(html)) !== null) {
        vins.add(vinMatch[1].toUpperCase());
      }

      // Extract all make/model combinations
      const makeModelRegex = /(Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Dodge|Ferrari|Fiat|Ford|Genesis|GMC|Honda|Hyundai|Infiniti|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Maserati|Mazda|McLaren|Mercedes-Benz|MINI|Mitsubishi|Nissan|Porsche|Ram|Rolls-Royce|Subaru|Tesla|Toyota|Volkswagen|Volvo)\s+([A-Za-z0-9\s\-]+)/gi;
      const makeModels = new Set<string>();
      let makeModelMatch;
      while ((makeModelMatch = makeModelRegex.exec(html)) !== null) {
        const make = makeModelMatch[1];
        const model = makeModelMatch[2]?.trim();
        makeModels.add(`${make} ${model}`);
      }

      // Extract prices
      const priceRegex = /\$[\s]?([\d,]+(?:\.\d{2})?)/g;
      const prices = new Set<string>();
      let priceMatch;
      while ((priceMatch = priceRegex.exec(html)) !== null) {
        prices.add(priceMatch[1]);
      }

      // Extract years
      const yearRegex = /(19|20)\d{2}/g;
      const years = new Set<string>();
      let yearMatch;
      while ((yearMatch = yearRegex.exec(html)) !== null) {
        years.add(yearMatch[0]);
      }

      res.json({
        status: "success",
        apiStatus: status,
        apiOk: ok,
        htmlLength,
        preview,
        analysis: {
          vinsFound: Array.from(vins),
          makeModelsFound: Array.from(makeModels),
          pricesFound: Array.from(prices).slice(0, 20),
          yearsFound: Array.from(years)
        },
        rawHtml: html
      });
    } catch (error) {
      console.error("Error testing ScrapingDog:", error);
      res.status(500).json({ error: "Failed to test ScrapingDog", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Bulk inventory extraction - extracts all cars from a listing page with multiple strategies
  app.post("/api/scrape-inventory-bulk", async (req, res) => {
    try {
      const { url, useRendering } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const apiKey = process.env.SCRAPINGDOG_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "ScrapingDog API key not configured" });
      }

      let html = "";
      let renderMethod = "unknown";

      // Try multiple approaches to get the HTML content
      try {
        // First attempt: Try with rendering if explicitly requested or try both
        if (useRendering !== false) {
          console.log("Attempting ScrapingDog with render=true");
          const scrapingDogUrl = `https://api.scrapingdog.com/scrape?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true`;
          const response = await fetch(scrapingDogUrl, {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          
          if (response.ok) {
            html = await response.text();
            renderMethod = "dynamic (render=true)";
            console.log("Successfully fetched with render=true");
          } else {
            console.log("render=true failed, trying alternative methods");
            throw new Error("render=true failed");
          }
        }
      } catch (err) {
        console.log("Attempting ScrapingDog with dynamic=false");
        try {
          // Second attempt: Try without rendering (static content)
          const scrapingDogUrl = `https://api.scrapingdog.com/scrape?api_key=${apiKey}&url=${encodeURIComponent(url)}&dynamic=false`;
          const response = await fetch(scrapingDogUrl, {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          
          if (response.ok) {
            html = await response.text();
            renderMethod = "static (dynamic=false)";
            console.log("Successfully fetched with dynamic=false");
          } else {
            console.log("dynamic=false failed");
            throw new Error("dynamic=false failed");
          }
        } catch (err2) {
          console.log("All ScrapingDog methods failed, attempting direct fetch");
          // Third attempt: Direct fetch as fallback
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          
          if (response.ok) {
            html = await response.text();
            renderMethod = "direct fetch";
            console.log("Successfully fetched with direct fetch");
          } else {
            throw new Error("All fetch methods failed");
          }
        }
      }

      if (!html) {
        return res.status(400).json({ error: "Failed to fetch page content with any method" });
      }

      const cars: any[] = [];

      // Extract all VINs first (17-character alphanumeric)
      const vinRegex = /\b([A-HJ-NPR-Z0-9]{17})\b/gi;
      let vinMatches;
      const vins = new Set<string>();

      while ((vinMatches = vinRegex.exec(html)) !== null) {
        vins.add(vinMatches[1].toUpperCase());
      }

      // If no VINs found, try to extract by other patterns (common for dealerships)
      if (vins.size === 0) {
        console.log("No VINs found, attempting to extract by vehicle info patterns");
        
        // Look for make/model patterns and extract associated data
        const makeModelPattern = /(Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Dodge|Ferrari|Fiat|Ford|Genesis|GMC|Honda|Hyundai|Infiniti|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Maserati|Mazda|McLaren|Mercedes-Benz|MINI|Mitsubishi|Nissan|Porsche|Ram|Rolls-Royce|Subaru|Tesla|Toyota|Volkswagen|Volvo)\s+([A-Za-z0-9\s\-]+)/gi;
        
        let makeModelMatch;
        const processedCars = new Map();
        
        while ((makeModelMatch = makeModelPattern.exec(html)) !== null) {
          const make = makeModelMatch[1];
          const model = makeModelMatch[2]?.trim();
          const key = `${make}-${model}`;
          
          if (!processedCars.has(key)) {
            processedCars.set(key, { make, model });
          }
        }
        
        // Convert map to array
        const carDataArray = Array.from(processedCars.values());
        for (const carData of carDataArray) {
          const make = carData.make;
          const model = carData.model;
          
          // Find context around this make/model
          const pattern = new RegExp(make + '\\s+' + model.split(' ')[0], 'i');
          const index = html.search(pattern);
          
          if (index !== -1) {
            const context = html.substring(Math.max(0, index - 400), Math.min(html.length, index + 1200));
            
            const car: any = { make, model };
            
            // Extract year
            const yearMatch = context.match(/(19|20)\d{2}/);
            if (yearMatch) car.year = yearMatch[0];
            
            // Extract trim
            const trimMatch = context.match(/(?:Trim|Edition|Package|Model)[\s:]*["']?([A-Za-z0-9\s]+)["']?/i);
            if (trimMatch) car.trim = trimMatch[1].trim();
            
            // Extract color
            const colorMatch = context.match(/(Black|White|Silver|Gray|Red|Blue|Brown|Green|Beige|Gold|Orange|Yellow|Purple|Charcoal|Burgundy|Maroon|Navy|Teal|Cyan|Lime|Pearl)/i);
            if (colorMatch) car.color = colorMatch[0];
            
            // Extract price
            const priceMatch = context.match(/\$[\s]?([\d,]+(?:\.\d{2})?)/);
            if (priceMatch) car.price = priceMatch[1].replace(/,/g, "");
            
            // Extract kilometers
            const kmsMatch = context.match(/([\d,]+)\s*(?:km|kilometers|miles)/i);
            if (kmsMatch) car.kilometers = kmsMatch[1].replace(/,/g, "");
            
            // Extract stock number
            const stockMatch = context.match(/Stock[\s:#]*([\w\-]+)/i);
            if (stockMatch) car.stockNumber = stockMatch[1].trim();
            
            // Extract fuel type
            const fuelMatch = context.match(/(Gasoline|Diesel|Electric|Hybrid|Plug-in Hybrid)/i);
            if (fuelMatch) car.fuelType = fuelMatch[0];
            
            // Extract transmission
            const transMatch = context.match(/(Automatic|Manual|CVT|Dual-Clutch)/i);
            if (transMatch) car.transmission = transMatch[0];
            
            // Extract body type
            const bodyMatch = context.match(/(Sedan|SUV|Truck|Coupe|Hatchback|Van|Wagon|Convertible)/i);
            if (bodyMatch) car.bodyType = bodyMatch[0];
            
            cars.push(car);
          }
        }
      } else {
        // Extract data for each VIN found
        for (const vin of Array.from(vins).slice(0, 50)) {
          const car: any = { vin };

          // Extract context around VIN to get related data
          const vinIndex = html.indexOf(vin);
          const context = html.substring(Math.max(0, vinIndex - 500), Math.min(html.length, vinIndex + 1000));

          // Extract year
          const yearMatch = context.match(/(19|20)\d{2}/);
          if (yearMatch) car.year = yearMatch[0];

          // Extract make/model
          const makeModelMatch = context.match(/(Acura|Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Buick|Cadillac|Chevrolet|Chrysler|Dodge|Ferrari|Fiat|Ford|Genesis|GMC|Honda|Hyundai|Infiniti|Jaguar|Jeep|Kia|Lamborghini|Land Rover|Lexus|Lincoln|Maserati|Mazda|McLaren|Mercedes-Benz|MINI|Mitsubishi|Nissan|Porsche|Ram|Rolls-Royce|Subaru|Tesla|Toyota|Volkswagen|Volvo)\s+([A-Za-z0-9\s\-]+)/i);
          if (makeModelMatch) {
            car.make = makeModelMatch[1];
            car.model = makeModelMatch[2]?.trim();
          }

          // Extract trim
          const trimMatch = context.match(/(?:Trim|Edition|Package)[\s:]*["']?([A-Za-z0-9\s]+)["']?/i);
          if (trimMatch) car.trim = trimMatch[1].trim();

          // Extract color
          const colorMatch = context.match(/(Black|White|Silver|Gray|Red|Blue|Brown|Green|Beige|Gold|Orange|Yellow|Purple|Charcoal|Burgundy|Maroon|Navy|Teal|Cyan|Lime|Pearl)/i);
          if (colorMatch) car.color = colorMatch[0];

          // Extract price
          const priceMatch = context.match(/\$[\s]?([\d,]+(?:\.\d{2})?)/);
          if (priceMatch) car.price = priceMatch[1].replace(/,/g, "");

          // Extract kilometers
          const kmsMatch = context.match(/([\d,]+)\s*(?:km|kilometers)/i);
          if (kmsMatch) car.kilometers = kmsMatch[1].replace(/,/g, "");

          // Extract stock number
          const stockMatch = context.match(/Stock[\s:#]*([\w\-]+)/i);
          if (stockMatch) car.stockNumber = stockMatch[1].trim();

          // Extract fuel type
          const fuelMatch = context.match(/(Gasoline|Diesel|Electric|Hybrid|Plug-in Hybrid)/i);
          if (fuelMatch) car.fuelType = fuelMatch[0];

          // Extract transmission
          const transMatch = context.match(/(Automatic|Manual|CVT|Dual-Clutch)/i);
          if (transMatch) car.transmission = transMatch[0];

          // Look for carfax link
          const carfaxMatch = html.match(/https:\/\/(?:www\.)?carfax[^\s<>"]+/i);
          if (carfaxMatch) car.carfaxLink = carfaxMatch[0];

          // Extract body type
          const bodyMatch = context.match(/(Sedan|SUV|Truck|Coupe|Hatchback|Van|Wagon|Convertible)/i);
          if (bodyMatch) car.bodyType = bodyMatch[0];

          // Only add cars that have at least VIN or make/model
          if (car.vin || (car.make && car.model)) {
            cars.push(car);
          }
        }
      }

      res.json({ 
        cars,
        totalFound: cars.length,
        vinsExtracted: Array.from(vins).length,
        renderMethod,
        status: "success"
      });
    } catch (error) {
      console.error("Error with bulk scraping:", error);
      res.status(500).json({ error: "Failed to scrape inventory from listing page", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Claude AI Parser endpoint - Chunked processing for large files
  app.post("/api/parse-with-claude", async (req, res) => {
    try {
      const { textContent } = req.body;

      if (!textContent || typeof textContent !== 'string') {
        return res.status(400).json({ error: "Text content is required" });
      }

      const apiKey = process.env.CLAUDE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Claude API key not configured" });
      }

      const anthropic = new Anthropic({ apiKey });

      // Split content into vehicle chunks based on VIN patterns and common separators
      const chunks = splitIntoVehicleChunks(textContent);
      console.log(`Split file into ${chunks.length} vehicle chunks`);

      const allVehicles: string[] = [];
      let processedCount = 0;

      // Process each chunk with Claude
      for (const chunk of chunks) {
        try {
          const prompt = `Extract vehicle data from this HTML/text snippet and return ONLY CSV rows (no header).

CSV format (use these exact columns):
year,make,model,trim,color,price,kilometers,vin,stock_number,condition,transmission,fuel_type,body_type,drivetrain,engine_cy,engine_di,listing_link,carfax_link,notes

Rules:
- Extract all vehicles in this snippet
- Use empty string "" for missing values
- condition: "used" or "new"
- drivetrain: "fwd","rwd","awd","4wd"
- price/kilometers: numbers only (no $ or units)
- Wrap values in quotes if they contain commas
- Return ONLY the CSV rows, no header, no explanations

Content:
${chunk}`;

          const message = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            messages: [{
              role: "user",
              content: prompt
            }]
          });

          const csvRows = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
          if (csvRows && !csvRows.toLowerCase().includes('no vehicle') && csvRows.length > 10) {
            allVehicles.push(csvRows);
          }

          processedCount++;
          console.log(`Processed chunk ${processedCount}/${chunks.length}`);
        } catch (chunkError) {
          console.error(`Error processing chunk ${processedCount}:`, chunkError);
          // Continue with other chunks
        }
      }

      // Combine all CSV rows with header
      const header = "year,make,model,trim,color,price,kilometers,vin,stock_number,condition,transmission,fuel_type,body_type,drivetrain,engine_cy,engine_di,listing_link,carfax_link,notes";
      const fullCsv = header + "\n" + allVehicles.join("\n");

      console.log(`Successfully extracted ${allVehicles.length} vehicle entries from ${chunks.length} chunks`);

      res.json({ 
        csv: fullCsv,
        stats: {
          totalChunks: chunks.length,
          vehiclesExtracted: allVehicles.length
        }
      });
    } catch (error) {
      console.error("Error parsing with Claude:", error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to parse with Claude';
      res.status(500).json({ error: errorMsg });
    }
  });

  // Helper function to split large HTML/text into vehicle chunks
  function splitIntoVehicleChunks(content: string): string[] {
    const chunks: string[] = [];
    const maxChunkSize = 8000; // Conservative size per chunk (~2k tokens)

    // Try to find VIN patterns or vehicle separators
    const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/g;
    const matches = Array.from(content.matchAll(vinPattern));

    if (matches.length > 0) {
      // Split by VIN occurrences
      let lastIndex = 0;
      matches.forEach((match, i) => {
        const vinIndex = match.index || 0;
        const start = Math.max(0, vinIndex - 500); // Include context before VIN
        const end = Math.min(content.length, vinIndex + 2000); // Include context after VIN
        
        if (start > lastIndex) {
          const chunkContent = content.substring(start, end);
          if (chunkContent.trim().length > 50) {
            chunks.push(chunkContent);
          }
          lastIndex = end;
        }
      });
    } else {
      // No VINs found, split by size with overlap
      for (let i = 0; i < content.length; i += maxChunkSize) {
        const chunk = content.substring(i, Math.min(i + maxChunkSize + 500, content.length));
        if (chunk.trim().length > 50) {
          chunks.push(chunk);
        }
      }
    }

    return chunks.length > 0 ? chunks : [content.substring(0, maxChunkSize)];
  }

  const httpServer = createServer(app);
  return httpServer;
}
