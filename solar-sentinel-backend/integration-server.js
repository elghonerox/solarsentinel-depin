/**
 * SolarSentinel Integration Server
 * Bridges React Frontend with AI Service and Hedera Backend
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { SolarSentinelBackend } = require('./solar-sentinel-backend');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

class IntegrationServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
        this.backend = null;
        this.isInitialized = false;
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // CORS configuration for React app
        this.app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    integration: 'running',
                    hedera: this.backend ? 'connected' : 'disconnected',
                    aiService: 'checking...'
                }
            };

            res.json(health);
        });

        // Dashboard data endpoint - Main endpoint for React app
        this.app.get('/dashboard-data', async (req, res) => {
            try {
                // Generate synthetic sensor data and get AI predictions
                const sensorReadings = await this.generateSensorReadings();
                
                // Get AI predictions for each reading
                const enrichedReadings = await Promise.all(
                    sensorReadings.map(async (reading) => {
                        try {
                            const aiPrediction = await this.getAIPrediction(reading.sensorData);
                            return {
                                ...reading,
                                aiPrediction,
                                status: aiPrediction.prediction?.status || 'Unknown'
                            };
                        } catch (error) {
                            logger.warn('AI prediction failed for reading', { error: error.message });
                            return {
                                ...reading,
                                aiPrediction: { error: 'AI service unavailable' },
                                status: 'Unknown'
                            };
                        }
                    })
                );

                // Calculate summary statistics
                const summary = this.calculateSummaryStats(enrichedReadings);

                const dashboardData = {
                    timestamp: new Date().toISOString(),
                    summary,
                    sensors: enrichedReadings,
                    hedera: {
                        network: 'testnet',
                        topicId: this.backend?.topicId || 'Not initialized',
                        tokenId: this.backend?.tokenId || 'Not initialized'
                    }
                };

                res.json({
                    success: true,
                    data: dashboardData
                });

            } catch (error) {
                logger.error('Dashboard data generation failed:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to generate dashboard data',
                    message: error.message
                });
            }
        });

        // Impact metrics endpoint
        this.app.get('/metrics/impact', async (req, res) => {
            try {
                const impactMetrics = {
                    timestamp: new Date().toISOString(),
                    carbonCredits: {
                        totalSaved: 127.34,
                        monthlyTrend: 8.5,
                        value: '$63.67'
                    },
                    energyProduction: {
                        totalKWh: 2847.6,
                        monthlyIncrease: 12.3,
                        efficiency: 87.2
                    },
                    tokensEarned: {
                        total: this.backend?.metrics?.getMetrics().tokensEarned / 100 || 0,
                        thisMonth: 145.20,
                        tier: 'GOLD'
                    },
                    communityImpact: {
                        householdsServed: 23,
                        co2Avoided: 318.7,
                        costSavings: '$1,247'
                    },
                    systemHealth: {
                        operational: 19,
                        warnings: 3,
                        critical: 1,
                        maintenance: 2
                    }
                };

                res.json({
                    success: true,
                    impact: impactMetrics
                });

            } catch (error) {
                logger.error('Impact metrics generation failed:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to generate impact metrics'
                });
            }
        });

        // Process sensor reading endpoint
        this.app.post('/sensor-reading', async (req, res) => {
            try {
                const { sensorData, metadata } = req.body;

                if (!this.backend) {
                    throw new Error('Hedera backend not initialized');
                }

                // Process through Hedera backend
                const result = await this.backend.processSensorReading(sensorData, metadata);

                res.json({
                    success: true,
                    result
                });

            } catch (error) {
                logger.error('Sensor reading processing failed:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // AI prediction proxy endpoint
        this.app.post('/ai/predict', async (req, res) => {
            try {
                const prediction = await this.getAIPrediction(req.body);
                res.json(prediction);
            } catch (error) {
                logger.error('AI prediction failed:', error);
                res.status(500).json({
                    success: false,
                    error: 'AI prediction failed'
                });
            }
        });

        // System status endpoint
        this.app.get('/status', (req, res) => {
            const status = {
                server: 'running',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                hedera: {
                    initialized: !!this.backend,
                    healthy: this.backend?.isHealthy || false
                },
                aiService: {
                    url: this.aiServiceUrl,
                    status: 'checking'
                }
            };

            if (this.backend) {
                status.hedera = {
                    ...status.hedera,
                    ...this.backend.getSystemHealth()
                };
            }

            res.json(status);
        });
    }

    async generateSensorReadings() {
        // Generate realistic sensor data for African solar installations
        const locations = [
            { id: 'LAGOS_001', name: 'Lagos Community Center', region: 'Nigeria' },
            { id: 'NAIROBI_002', name: 'Nairobi Rural Clinic', region: 'Kenya' },
            { id: 'CAPE_003', name: 'Cape Town School', region: 'South Africa' },
            { id: 'ACCRA_004', name: 'Accra Market', region: 'Ghana' },
            { id: 'CAIRO_005', name: 'Cairo Hospital', region: 'Egypt' }
        ];

        return locations.map((location, index) => {
            // Simulate different performance levels
            const baseVoltage = 12.0 + Math.random() * 2 - 1; // 11-13V
            const baseTemp = 25 + Math.random() * 35; // 25-60°C
            const timeOfDay = new Date().getHours();
            
            // Simulate solar output based on time of day
            let outputMultiplier = 1.0;
            if (timeOfDay < 6 || timeOfDay > 19) {
                outputMultiplier = 0.1; // Night/early morning
            } else if (timeOfDay >= 6 && timeOfDay <= 8) {
                outputMultiplier = 0.4; // Early morning
            } else if (timeOfDay >= 9 && timeOfDay <= 15) {
                outputMultiplier = 1.0; // Peak hours
            } else {
                outputMultiplier = 0.6; // Evening
            }

            const baseOutput = (150 + Math.random() * 100) * outputMultiplier;

            // Add some variation for different scenarios
            let sensorData;
            if (index === 0) {
                // Excellent performance
                sensorData = {
                    voltage: 12.8,
                    temp: 35,
                    output: Math.max(baseOutput * 1.2, 180)
                };
            } else if (index === 1) {
                // Warning scenario
                sensorData = {
                    voltage: 11.2,
                    temp: Math.min(baseTemp + 15, 65),
                    output: baseOutput * 0.8
                };
            } else if (index === 2) {
                // Critical scenario
                sensorData = {
                    voltage: Math.max(baseVoltage - 2, 8),
                    temp: Math.min(baseTemp + 25, 75),
                    output: Math.max(baseOutput * 0.3, 30)
                };
            } else {
                // Normal operation
                sensorData = {
                    voltage: parseFloat(baseVoltage.toFixed(1)),
                    temp: parseFloat(baseTemp.toFixed(1)),
                    output: parseFloat(baseOutput.toFixed(1))
                };
            }

            return {
                deviceId: location.id,
                location: location.name,
                region: location.region,
                sensorData,
                timestamp: new Date().toISOString(),
                firmware: '2.0.1'
            };
        });
    }

    async getAIPrediction(sensorData) {
        try {
            const response = await axios.post(`${this.aiServiceUrl}/predict`, {
                data: [sensorData.voltage, sensorData.temp, sensorData.output]
            }, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            logger.warn('AI service request failed:', error.message);
            throw new Error('AI service unavailable');
        }
    }

    calculateSummaryStats(readings) {
        const totalSystems = readings.length;
        const operational = readings.filter(r => 
            r.status === 'Normal' || r.status === 'Excellent Performance'
        ).length;
        const warnings = readings.filter(r => 
            r.status && r.status.includes('Warning')
        ).length;
        const critical = readings.filter(r => 
            r.status && r.status.includes('Failure')
        ).length;

        const totalOutput = readings.reduce((sum, r) => sum + r.sensorData.output, 0);
        const avgTemp = readings.reduce((sum, r) => sum + r.sensorData.temp, 0) / readings.length;
        const avgVoltage = readings.reduce((sum, r) => sum + r.sensorData.voltage, 0) / readings.length;

        return {
            totalSystems,
            operational,
            warnings,
            critical,
            totalOutput: parseFloat(totalOutput.toFixed(1)),
            averageTemperature: parseFloat(avgTemp.toFixed(1)),
            averageVoltage: parseFloat(avgVoltage.toFixed(1)),
            systemHealth: parseFloat(((operational / totalSystems) * 100).toFixed(1))
        };
    }

    async initializeHederaBackend() {
        try {
            logger.info('Initializing Hedera backend...');
            this.backend = new SolarSentinelBackend();
            
            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Create resources if needed
            if (!this.backend.topicId) {
                await this.backend.createTopic();
            }
            if (!this.backend.tokenId) {
                await this.backend.createToken();
            }

            this.isInitialized = true;
            logger.info('Hedera backend initialized successfully');
            
        } catch (error) {
            logger.error('Failed to initialize Hedera backend:', error.message);
            // Continue without Hedera backend for demo purposes
            this.isInitialized = false;
        }
    }

    async start() {
        try {
            // Initialize Hedera backend in background
            this.initializeHederaBackend().catch(error => {
                logger.warn('Hedera backend initialization failed, continuing without it:', error.message);
            });

            // Start HTTP server immediately
            this.app.listen(this.port, () => {
                console.log('\n🚀 SolarSentinel Integration Server Running!');
                console.log(`📡 Server: http://localhost:${this.port}`);
                console.log(`🤖 AI Service: ${this.aiServiceUrl}`);
                console.log(`⚛️  React App: http://localhost:3000`);
                console.log('\n📊 Available Endpoints:');
                console.log(`   GET  /health              - Health check`);
                console.log(`   GET  /dashboard-data      - Main dashboard data`);
                console.log(`   GET  /metrics/impact      - Impact metrics`);
                console.log(`   GET  /status              - System status`);
                console.log(`   POST /sensor-reading      - Process sensor data`);
                console.log(`   POST /ai/predict          - AI predictions`);
                console.log('\n✅ React app should now connect successfully!');
                
                logger.info('Integration server started successfully', {
                    port: this.port,
                    aiServiceUrl: this.aiServiceUrl
                });
            });

            // Graceful shutdown handling
            process.on('SIGINT', async () => {
                console.log('\n🛑 Shutting down gracefully...');
                if (this.backend) {
                    await this.backend.cleanup();
                }
                process.exit(0);
            });

        } catch (error) {
            logger.error('Failed to start integration server:', error);
            throw error;
        }
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const server = new IntegrationServer();
    server.start().catch(error => {
        console.error('❌ Failed to start integration server:', error.message);
        process.exit(1);
    });
}

module.exports = IntegrationServer;