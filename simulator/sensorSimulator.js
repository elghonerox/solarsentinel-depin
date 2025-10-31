const express = require('express');
const cors = require('cors');

/**
 * IoT Sensor Simulator
 * 
 * Generates realistic solar panel sensor readings based on:
 * - Documented African climate patterns (Kenya, Nigeria)
 * - Published panel degradation research
 * - Real-world failure mode data
 * 
 * Simulated Sensor Types:
 * - Voltage sensor (INA219 equivalent)
 * - Temperature sensor (DS18B20 equivalent)
 * - Current sensor (for power calculation)
 * 
 * CRITICAL: This is SIMULATED data, not real hardware.
 * Real IoT deployment is the next validation phase.
 */

const app = express();
const PORT = process.env.SIMULATOR_PORT || 4000;

app.use(cors());
app.use(express.json());

// Simulation state
let deviceCounter = 0;

/**
 * Generate realistic sensor reading
 * 
 * Models different operating conditions:
 * - Normal operation (80% probability)
 * - Dust accumulation (10%)
 * - Overheating (5%)
 * - Voltage issues (5%)
 * 
 * Returns sensor data matching real hardware output format
 */
function generateSensorReading() {
  const rand = Math.random();
  
  let voltage, temperature, powerOutput;
  let condition = 'normal';
  
  if (rand < 0.80) {
    // Normal operation
    voltage = 11.5 + Math.random() * 1.0;  // 11.5-12.5V
    temperature = 25 + Math.random() * 10;  // 25-35°C
    powerOutput = 180 + Math.random() * 40; // 180-220W
    condition = 'normal';
    
  } else if (rand < 0.90) {
    // Dust accumulation (reduced power, slightly elevated temp)
    voltage = 10.5 + Math.random() * 1.0;  // 10.5-11.5V
    temperature = 30 + Math.random() * 8;   // 30-38°C
    powerOutput = 120 + Math.random() * 50; // 120-170W
    condition = 'dust_accumulation';
    
  } else if (rand < 0.95) {
    // Overheating (high temp, voltage drop, low power)
    voltage = 10.0 + Math.random() * 1.0;  // 10-11V
    temperature = 40 + Math.random() * 8;   // 40-48°C
    powerOutput = 100 + Math.random() * 50; // 100-150W
    condition = 'overheating';
    
  } else {
    // Voltage drop / connection issue
    voltage = 9.0 + Math.random() * 1.5;   // 9-10.5V
    temperature = 25 + Math.random() * 10;  // 25-35°C
    powerOutput = 80 + Math.random() * 50;  // 80-130W
    condition = 'voltage_drop';
  }
  
  return {
    deviceId: `SIM_PANEL_${String(deviceCounter++).padStart(4, '0')}`,
    timestamp: new Date().toISOString(),
    voltage: parseFloat(voltage.toFixed(2)),
    temperature: parseFloat(temperature.toFixed(1)),
    powerOutput: parseFloat(powerOutput.toFixed(1)),
    condition: condition, // Internal metadata (not sent to real sensors)
    location: {
      region: selectRandomRegion(),
      coordinates: generateRandomCoordinates()
    }
  };
}

/**
 * Select random African region for simulation diversity
 */
function selectRandomRegion() {
  const regions = [
    'Nairobi, Kenya',
    'Lagos, Nigeria',
    'Cape Town, South Africa',
    'Accra, Ghana',
    'Addis Ababa, Ethiopia'
  ];
  return regions[Math.floor(Math.random() * regions.length)];
}

/**
 * Generate random coordinates within African solar belt
 */
function generateRandomCoordinates() {
  // Rough African solar belt: Lat -35 to 15, Lon -20 to 50
  const lat = -35 + Math.random() * 50;
  const lon = -20 + Math.random() * 70;
  return {
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lon.toFixed(6))
  };
}

// Routes

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    simulator: 'running',
    readings_generated: deviceCounter
  });
});

/**
 * Generate single sensor reading
 * GET /api/generate
 */
app.get('/api/generate', (req, res) => {
  const reading = generateSensorReading();
  res.json(reading);
});
app.get('/api/generate-reading', (req, res) => {
  const reading = generateSensorReading();
  console.log('📊 Frontend requested reading:', reading.condition);
  res.json(reading);
});
/**
 * Generate single sensor reading (alternative endpoint name)
 * GET /api/generate-reading
 */
app.get('/api/generate-reading', (req, res) => {
  const reading = generateSensorReading();
  res.json(reading);
});

/**
 * Generate batch of readings
 * GET /api/generate/batch?count=10
 */
app.get('/api/generate/batch', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const max_count = 100; // Prevent abuse
  
  const actualCount = Math.min(count, max_count);
  const readings = [];
  
  for (let i = 0; i < actualCount; i++) {
    readings.push(generateSensorReading());
  }
  
  res.json({
    count: readings.length,
    readings: readings
  });
});

/**
 * Get simulator statistics
 * GET /api/stats
 */
app.get('/api/stats', (req, res) => {
  res.json({
    total_readings_generated: deviceCounter,
    simulation_model: 'African solar conditions',
    data_sources: [
      'NREL Solar Resource Database',
      'Kenya/Nigeria climate data',
      'Published panel degradation research'
    ],
    failure_modes_simulated: [
      'Dust accumulation (10%)',
      'Overheating (5%)',
      'Voltage drops (5%)',
      'Normal operation (80%)'
    ],
    limitations: [
      'Synthetic data, not real hardware',
      'Does not capture: theft, vandalism, connector corrosion',
      'Simplified climate model',
      'No seasonal variations'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔄 SolarSentinel Simulator running on port ${PORT}`);
  console.log(`📊 Generating realistic African solar panel sensor data`);
  console.log(`⚠️  Note: This is SIMULATED data, not from real hardware`);
});