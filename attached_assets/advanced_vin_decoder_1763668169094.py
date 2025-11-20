#!/usr/bin/env python3
"""
ADVANCED NHTSA VIN DECODER WITH CANADIAN TRIMS
For Replit - Combines NHTSA API data with comprehensive Canadian trim database
Run: python3 advanced_vin_decoder.py
"""

import requests
import csv
import json
from typing import Dict, List, Optional, Set
from io import StringIO
from pathlib import Path
import sys

class CanadianVINDecoder:
    """
    Advanced VIN Decoder combining NHTSA with Canadian-specific trim data
    Supports vehicles from 1995 onwards
    """
    
    def __init__(self, csv_path: str = None):
        self.nhtsa_base_url = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues"
        self.canadian_trims = self._load_canadian_trims(csv_path)
        self.cache = {}
    
    def _load_canadian_trims(self, csv_path: Optional[str] = None) -> Dict:
        """Load Canadian trims from CSV file"""
        canadian_data = {}
        
        # Try to load from CSV file first
        if csv_path and Path(csv_path).exists():
            try:
                with open(csv_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        make = row['make'].upper()
                        model = row['model'].upper()
                        year = row['year']
                        trims = [t.strip() for t in row['trims'].split(',')]
                        
                        if make not in canadian_data:
                            canadian_data[make] = {}
                        if model not in canadian_data[make]:
                            canadian_data[make][model] = {}
                        
                        canadian_data[make][model][year] = trims
                
                print(f"✓ Loaded Canadian trims from: {csv_path}")
                return canadian_data
            except Exception as e:
                print(f"⚠ Error loading CSV: {e}")
        
        # Fallback embedded database if file not found
        return self._get_default_canadian_trims()
    
    def _get_default_canadian_trims(self) -> Dict:
        """Default Canadian trims database"""
        return {
            "FORD": {
                "F-150": {
                    "1995": ["Regular Cab", "SuperCab", "XLT", "Lariat"],
                    "2004": ["Regular Cab", "SuperCab", "SuperCrew", "STX", "XLT", "Lariat", "King Ranch", "FX4"],
                    "2015": ["Regular Cab", "SuperCrew", "XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited"],
                },
                "Mustang": {"1995": ["Coupe", "Convertible", "GT"], "2015": ["EcoBoost", "GT", "Shelby GT350"]},
            },
            "CHEVROLET": {
                "Silverado": {
                    "1995": ["C1500", "C2500", "K1500", "K2500"],
                    "2007": ["Regular Cab", "Extended Cab", "Crew Cab", "LS", "LT", "LTZ"],
                    "2014": ["Regular Cab", "Double Cab", "Crew Cab", "LS", "LT", "High Country"],
                },
                "Malibu": {"2005": ["LS", "LT", "LTZ"]},
            },
            "TOYOTA": {
                "Camry": {
                    "1995": ["DX", "LE", "XLE", "SE"],
                    "2005": ["LE", "XLE", "SE", "XSE", "Hybrid"],
                    "2015": ["LE", "XLE", "SE", "XSE", "Hybrid"],
                },
                "Corolla": {
                    "1995": ["DX", "LE", "CE"],
                    "2015": ["L", "LE", "S", "SE", "XSE"],
                },
            },
            "HONDA": {
                "Civic": {
                    "1995": ["DX", "EX", "LX", "Si"],
                    "2006": ["DX", "LX", "EX", "Si", "Hybrid"],
                    "2016": ["LX", "EX", "EX-L", "Si", "Type R"],
                },
                "Accord": {
                    "1995": ["DX", "EX", "LX", "SE"],
                    "2013": ["LX", "Sport", "EX", "EX-L", "Touring", "Hybrid"],
                },
            },
        }
    
    def decode_vin(self, vin: str, verbose: bool = True) -> Dict:
        """
        Decode VIN and enhance with Canadian trim data
        Returns comprehensive vehicle information
        """
        
        # Validation
        if not vin or len(vin) < 10:
            return self._error("VIN must be at least 10 characters long")
        
        vin = vin.upper().strip()
        
        # Check cache
        if vin in self.cache:
            return self.cache[vin]
        
        # Get NHTSA data
        nhtsa_result = self._fetch_nhtsa_data(vin)
        if nhtsa_result.get("error"):
            return nhtsa_result
        
        # Enhance with Canadian data
        result = self._enhance_with_canadian_trims(nhtsa_result)
        
        # Cache result
        self.cache[vin] = result
        
        if verbose:
            self._print_result(result)
        
        return result
    
    def _fetch_nhtsa_data(self, vin: str) -> Dict:
        """Fetch data from NHTSA API"""
        try:
            params = {"format": "json", "data": f"Vehicle VIN:{vin}"}
            response = requests.get(self.nhtsa_base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("Count", 0) == 0:
                return self._error("VIN not found in NHTSA database")
            
            result = data.get("Results", [{}])[0]
            
            return {
                "vin": vin,
                "year": result.get("ModelYear"),
                "make": result.get("Make"),
                "model": result.get("Model"),
                "body_class": result.get("BodyClass"),
                "nhtsa_trim": result.get("Trim"),
                "engine": result.get("EngineDescription"),
                "transmission": result.get("TransmissionDescription"),
                "drive_type": result.get("DriveType"),
                "plant_country": result.get("PlantCountry"),
                "plant_state": result.get("PlantState"),
                "plant_city": result.get("PlantCity"),
                "series": result.get("Series"),
                "nhtsa_raw": result,
            }
        except requests.exceptions.Timeout:
            return self._error("NHTSA API timeout - check internet connection")
        except requests.exceptions.ConnectionError:
            return self._error("Cannot connect to NHTSA API")
        except Exception as e:
            return self._error(f"NHTSA API error: {str(e)}")
    
    def _enhance_with_canadian_trims(self, nhtsa_data: Dict) -> Dict:
        """Add Canadian trim options"""
        make = nhtsa_data.get("make", "").upper()
        model = nhtsa_data.get("model", "").upper()
        year = nhtsa_data.get("year")
        
        canadian_trims = []
        matched_year = None
        
        # Look up Canadian trims
        if make in self.canadian_trims and model in self.canadian_trims[make]:
            model_years = self.canadian_trims[make][model]
            
            if year:
                # Try exact year first
                if year in model_years:
                    canadian_trims = model_years[year]
                    matched_year = year
                else:
                    # Find closest year
                    closest = self._find_closest_year(year, list(model_years.keys()))
                    if closest:
                        canadian_trims = model_years[closest]
                        matched_year = closest
        
        # Add to result
        nhtsa_data["canadian_trims"] = canadian_trims
        nhtsa_data["canadian_trim_matched_year"] = matched_year
        nhtsa_data["canadian_trim_count"] = len(canadian_trims)
        nhtsa_data["has_canadian_data"] = bool(canadian_trims)
        
        return nhtsa_data
    
    def _find_closest_year(self, target: str, available: List[str]) -> Optional[str]:
        """Find closest available year in database"""
        try:
            target_year = int(target)
            available_years = [(int(y), y) for y in available]
            closest = min(available_years, key=lambda x: abs(x[0] - target_year))
            return closest[1]
        except (ValueError, IndexError):
            return None
    
    def _error(self, message: str) -> Dict:
        """Return error dict"""
        return {"error": message, "status": "FAILED"}
    
    def _print_result(self, result: Dict):
        """Pretty print result"""
        if result.get("error"):
            print(f"\n❌ ERROR: {result['error']}\n")
            return
        
        print("\n" + "="*80)
        print("VIN DECODE RESULT (NHTSA + CANADIAN TRIMS)")
        print("="*80)
        print(f"VIN: {result.get('vin')}")
        print(f"Year: {result.get('year')}")
        print(f"Make: {result.get('make')}")
        print(f"Model: {result.get('model')}")
        print(f"Body Class: {result.get('body_class')}")
        print(f"Series: {result.get('series')}")
        print(f"NHTSA Trim: {result.get('nhtsa_trim') or 'Not specified'}")
        print(f"Engine: {result.get('engine')}")
        print(f"Transmission: {result.get('transmission')}")
        print(f"Drive Type: {result.get('drive_type')}")
        print(f"Plant Country: {result.get('plant_country')}")
        print(f"Plant Location: {result.get('plant_city')}, {result.get('plant_state')}")
        
        if result.get('has_canadian_data'):
            print(f"\n✓ CANADIAN TRIMS AVAILABLE ({result.get('canadian_trim_count')}):")
            print(f"  Matched Year: {result.get('canadian_trim_matched_year')}")
            for i, trim in enumerate(result.get('canadian_trims', []), 1):
                print(f"  {i}. {trim}")
        else:
            print(f"\n⚠ No Canadian trim data available for this vehicle")
        
        print("="*80 + "\n")
    
    def decode_batch(self, vins: List[str], verbose: bool = False) -> List[Dict]:
        """Decode multiple VINs"""
        results = []
        print(f"\n📊 Decoding {len(vins)} VINs...\n")
        for i, vin in enumerate(vins, 1):
            print(f"[{i}/{len(vins)}] Decoding: {vin}")
            result = self.decode_vin(vin, verbose=verbose)
            results.append(result)
        return results
    
    def export_to_json(self, result: Dict, filename: str = "vin_result.json"):
        """Export result to JSON"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)
            print(f"✓ Exported to: {filename}")
        except Exception as e:
            print(f"❌ Export failed: {e}")
    
    def search_by_make_model(self, make: str, model: str) -> Dict:
        """Search available trims by make and model"""
        make = make.upper()
        model = model.upper()
        
        if make in self.canadian_trims and model in self.canadian_trims[make]:
            return self.canadian_trims[make][model]
        else:
            return {"message": f"No data found for {make} {model}"}


def interactive_mode():
    """Interactive CLI mode"""
    decoder = CanadianVINDecoder("canadian_trims_database.csv")
    
    print("\n" + "="*80)
    print("NHTSA VIN DECODER WITH CANADIAN TRIMS (1995+)")
    print("="*80)
    print("Commands:")
    print("  'decode <VIN>' - Decode a VIN")
    print("  'batch <file>' - Decode batch from file (one VIN per line)")
    print("  'search <make> <model>' - Search available Canadian trims")
    print("  'quit' - Exit")
    print("="*80 + "\n")
    
    while True:
        try:
            command = input(">>> ").strip()
            
            if command.lower() == "quit":
                print("Goodbye!")
                break
            
            elif command.lower().startswith("decode"):
                vin = command.replace("decode", "").strip()
                if vin:
                    decoder.decode_vin(vin)
            
            elif command.lower().startswith("search"):
                parts = command.replace("search", "").strip().split()
                if len(parts) >= 2:
                    make, model = parts[0], parts[1]
                    results = decoder.search_by_make_model(make, model)
                    print(json.dumps(results, indent=2))
            
            elif command.lower().startswith("batch"):
                filepath = command.replace("batch", "").strip()
                if Path(filepath).exists():
                    with open(filepath, 'r') as f:
                        vins = [line.strip() for line in f if line.strip()]
                    results = decoder.decode_batch(vins)
                    print(f"\n✓ Decoded {len(results)} VINs")
            
            else:
                print("❓ Unknown command")
        
        except KeyboardInterrupt:
            print("\n\nInterrupted. Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")


if __name__ == "__main__":
    # Example usage
    decoder = CanadianVINDecoder("canadian_trims_database.csv")
    
    # Test VINs
    test_vins = [
        "1FTMW1T88MFA00001",  # 2021 Ford F-150
        "2HGCV52626H503429",  # Honda Civic
        "1G1FB1S34G0152174",  # Chevrolet
    ]
    
    print("\n" + "="*80)
    print("TESTING VIN DECODER WITH SAMPLE VINs")
    print("="*80)
    
    for vin in test_vins:
        result = decoder.decode_vin(vin, verbose=True)
    
    # Interactive mode
    print("\nStarting interactive mode...\n")
    interactive_mode()
