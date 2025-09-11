/**
 * Hedera Authentication Diagnostics and Fix for SolarSentinel
 * 
 * This script diagnoses INVALID_SIGNATURE issues and provides multiple solutions
 * for the Hedera testnet authentication problems you're experiencing.
 */

const {
    Client,
    PrivateKey,
    AccountId,
    AccountBalanceQuery,
    TopicCreateTransaction,
    Hbar,
    Status
} = require('@hashgraph/sdk');

require('dotenv').config();

class HederaAuthDiagnostics {
    constructor() {
        this.client = null;
        this.operatorId = null;
        this.operatorKey = null;
        this.diagnosticResults = {
            environmentCheck: false,
            keyFormatCheck: false,
            accountIdCheck: false,
            networkConnectivity: false,
            accountBalance: null,
            authenticationTest: false,
            recommendedFixes: []
        };
    }

    /**
     * Comprehensive diagnostic suite for Hedera authentication
     */
    async runDiagnostics() {
        console.log('🔍 Starting Hedera Authentication Diagnostics...\n');
        
        try {
            await this.checkEnvironmentVariables();
            await this.validateKeyFormats();
            await this.testNetworkConnectivity();
            await this.testAuthentication();
            await this.generateRecommendations();
            
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Diagnostic failed:', error.message);
            this.generateEmergencyFixes();
        }
    }

    /**
     * Check environment variables
     */
    async checkEnvironmentVariables() {
        console.log('1️⃣ Checking Environment Variables...');
        
        const required = ['OPERATOR_ID', 'OPERATOR_KEY'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            console.log('❌ Missing environment variables:', missing.join(', '));
            this.diagnosticResults.recommendedFixes.push({
                issue: 'Missing environment variables',
                fix: 'Add missing variables to your .env file',
                priority: 'HIGH'
            });
            return false;
        }
        
        console.log('✅ All required environment variables present');
        this.diagnosticResults.environmentCheck = true;
        return true;
    }

    /**
     * Validate key formats and attempt multiple parsing methods
     */
    async validateKeyFormats() {
        console.log('\n2️⃣ Validating Key Formats...');
        
        try {
            // Test Account ID format
            const accountIdStr = process.env.OPERATOR_ID;
            if (!/^\d+\.\d+\.\d+$/.test(accountIdStr)) {
                throw new Error('Invalid Account ID format. Expected: 0.0.123456');
            }
            this.operatorId = AccountId.fromString(accountIdStr);
            console.log('✅ Account ID format valid:', accountIdStr);
            this.diagnosticResults.accountIdCheck = true;
            
            // Test Private Key format - try multiple methods
            const keyStr = process.env.OPERATOR_KEY;
            console.log('🔑 Testing private key formats...');
            
            let keyParsed = false;
            const keyMethods = [
                { name: 'PrivateKey.fromString', method: () => PrivateKey.fromString(keyStr) },
                { name: 'PrivateKey.fromStringECDSA', method: () => PrivateKey.fromStringECDSA(keyStr) },
                { name: 'PrivateKey.fromStringED25519', method: () => PrivateKey.fromStringED25519(keyStr) }
            ];
            
            for (const keyMethod of keyMethods) {
                try {
                    console.log(`   Testing ${keyMethod.name}...`);
                    this.operatorKey = keyMethod.method();
                    console.log(`✅ Key parsed successfully with ${keyMethod.name}`);
                    keyParsed = true;
                    break;
                } catch (error) {
                    console.log(`   ❌ ${keyMethod.name} failed: ${error.message}`);
                }
            }
            
            if (!keyParsed) {
                throw new Error('All key parsing methods failed');
            }
            
            console.log('✅ Private key validation successful');
            this.diagnosticResults.keyFormatCheck = true;
            
        } catch (error) {
            console.log('❌ Key validation failed:', error.message);
            this.diagnosticResults.recommendedFixes.push({
                issue: 'Invalid key format',
                fix: 'Check your OPERATOR_KEY format. Try ED25519 or ECDSA specific methods.',
                priority: 'HIGH'
            });
        }
    }

    /**
     * Test network connectivity and client initialization
     */
    async testNetworkConnectivity() {
        console.log('\n3️⃣ Testing Network Connectivity...');
        
        try {
            // Test different client initialization methods
            console.log('🌐 Initializing Hedera client...');
            
            // Method 1: Standard testnet client
            this.client = Client.forTestnet();
            this.client.setOperator(this.operatorId, this.operatorKey);
            
            // Set conservative limits
            this.client.setDefaultMaxTransactionFee(new Hbar(100));
            this.client.setDefaultMaxQueryPayment(new Hbar(1));
            
            console.log('✅ Client initialized for testnet');
            
            // Test basic connectivity with account balance query
            console.log('💰 Querying account balance...');
            const balance = await new AccountBalanceQuery()
                .setAccountId(this.operatorId)
                .execute(this.client);
            
            console.log(`✅ Account balance: ${balance.hbars.toString()}`);
            this.diagnosticResults.accountBalance = balance.hbars.toString();
            this.diagnosticResults.networkConnectivity = true;
            
            // Check if balance is sufficient
            if (balance.hbars.toTinybars().toNumber() < 100000000) { // Less than 1 HBAR
                this.diagnosticResults.recommendedFixes.push({
                    issue: 'Low account balance',
                    fix: 'Add more HBAR to your account. Visit portal.hedera.com for testnet faucet.',
                    priority: 'MEDIUM'
                });
            }
            
        } catch (error) {
            console.log('❌ Network connectivity failed:', error.message);
            this.diagnosticResults.recommendedFixes.push({
                issue: 'Network connectivity failed',
                fix: 'Check internet connection and Hedera network status',
                priority: 'HIGH'
            });
        }
    }

    /**
     * Test authentication with a simple transaction
     */
    async testAuthentication() {
        console.log('\n4️⃣ Testing Authentication...');
        
        if (!this.client || !this.diagnosticResults.networkConnectivity) {
            console.log('❌ Skipping authentication test - network issues');
            return;
        }
        
        try {
            console.log('🔐 Creating test topic to verify authentication...');
            
            // Use the exact same transaction setup as your failing code
            const transaction = new TopicCreateTransaction()
                .setTopicMemo("SolarSentinel Auth Test")
                .setSubmitKey(this.operatorKey)
                .setAutoRenewAccountId(this.operatorId)
                .setAutoRenewPeriod(7776000) // 90 days
                .setMaxTransactionFee(new Hbar(100)); // Match your config
            
            console.log('📝 Transaction created, attempting execution...');
            console.log('   Max Fee:', transaction.maxTransactionFee?.toString() || 'default');
            console.log('   Operator ID:', this.operatorId.toString());
            console.log('   Network:', 'testnet');
            
            const response = await transaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            
            if (receipt.status === Status.Success) {
                console.log('✅ Authentication test PASSED!');
                console.log('✅ Test topic created:', receipt.topicId.toString());
                this.diagnosticResults.authenticationTest = true;
            } else {
                throw new Error(`Transaction failed with status: ${receipt.status}`);
            }
            
        } catch (error) {
            console.log('❌ Authentication test failed:', error.message);
            console.log('   This is the same error you\'re experiencing in your app');
            
            // Analyze the specific error
            if (error.message.includes('INVALID_SIGNATURE')) {
                this.diagnosticResults.recommendedFixes.push({
                    issue: 'INVALID_SIGNATURE error',
                    fix: 'Key mismatch with account. Verify your OPERATOR_KEY corresponds to OPERATOR_ID.',
                    priority: 'CRITICAL'
                });
            }
        }
    }

    /**
     * Generate specific recommendations based on diagnostic results
     */
    async generateRecommendations() {
        console.log('\n5️⃣ Analyzing Results & Generating Recommendations...');
        
        // If authentication failed but other tests passed, focus on key issues
        if (this.diagnosticResults.networkConnectivity && 
            this.diagnosticResults.keyFormatCheck && 
            !this.diagnosticResults.authenticationTest) {
            
            this.diagnosticResults.recommendedFixes.push({
                issue: 'Authentication fails despite valid setup',
                fix: 'Your private key may not match your account ID. Generate a new key pair.',
                priority: 'CRITICAL'
            });
        }
        
        // Add general improvements
        this.diagnosticResults.recommendedFixes.push({
            issue: 'Optimization opportunity',
            fix: 'Use more specific key parsing methods for better reliability',
            priority: 'LOW'
        });
    }

    /**
     * Display comprehensive diagnostic results
     */
    displayResults() {
        console.log('\n📊 DIAGNOSTIC RESULTS SUMMARY');
        console.log('=' .repeat(50));
        
        const checks = [
            { name: 'Environment Variables', passed: this.diagnosticResults.environmentCheck },
            { name: 'Key Format Validation', passed: this.diagnosticResults.keyFormatCheck },
            { name: 'Account ID Check', passed: this.diagnosticResults.accountIdCheck },
            { name: 'Network Connectivity', passed: this.diagnosticResults.networkConnectivity },
            { name: 'Authentication Test', passed: this.diagnosticResults.authenticationTest }
        ];
        
        checks.forEach(check => {
            const status = check.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${check.name.padEnd(25)}: ${status}`);
        });
        
        if (this.diagnosticResults.accountBalance) {
            console.log(`Account Balance          : ${this.diagnosticResults.accountBalance}`);
        }
        
        console.log('\n🔧 RECOMMENDED FIXES:');
        console.log('=' .repeat(50));
        
        // Sort fixes by priority
        const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        const sortedFixes = this.diagnosticResults.recommendedFixes
            .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        
        sortedFixes.forEach((fix, index) => {
            const priority = fix.priority === 'CRITICAL' ? '🚨' : 
                           fix.priority === 'HIGH' ? '⚠️' : 
                           fix.priority === 'MEDIUM' ? '⚡' : '💡';
            
            console.log(`\n${index + 1}. ${priority} ${fix.priority} PRIORITY`);
            console.log(`   Issue: ${fix.issue}`);
            console.log(`   Fix: ${fix.fix}`);
        });
        
        this.generateEnvironmentFile();
    }

    /**
     * Generate emergency fixes for critical issues
     */
    generateEmergencyFixes() {
        console.log('\n🚨 EMERGENCY RECOVERY MODE');
        console.log('=' .repeat(50));
        
        console.log('\n1. Check your .env file contains:');
        console.log('   OPERATOR_ID=0.0.YOUR_ACCOUNT_ID');
        console.log('   OPERATOR_KEY=YOUR_PRIVATE_KEY_HERE');
        console.log('   HEDERA_NETWORK=testnet');
        
        console.log('\n2. Get new credentials from Hedera Portal:');
        console.log('   Visit: https://portal.hedera.com/');
        console.log('   Create testnet account');
        console.log('   Download credentials');
        
        console.log('\n3. Test with minimal setup:');
        console.log('   Use the generated test code below');
    }

    /**
     * Generate a corrected environment file template
     */
    generateEnvironmentFile() {
        console.log('\n📄 CORRECTED .env TEMPLATE:');
        console.log('=' .repeat(50));
        
        const envTemplate = `# Hedera Testnet Configuration - SolarSentinel
OPERATOR_ID=0.0.6165979
OPERATOR_KEY=your_private_key_here_without_der_prefix

# Network Configuration
HEDERA_NETWORK=testnet
MAX_TRANSACTION_FEE=100000000

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info

# AI Service (optional for testing)
AI_SERVICE_URL=http://localhost:5000
AI_API_TIMEOUT=10000

# Token Configuration
REWARD_AMOUNT_PER_NORMAL=100
REWARD_AMOUNT_PER_EXCELLENT=150
MIN_OUTPUT_THRESHOLD=100
EXCELLENT_OUTPUT_THRESHOLD=200

# API Configuration
PORT=3000
CORS_ORIGIN=*

# Admin (optional)
ADMIN_KEY=your_admin_key_here
`;
        console.log(envTemplate);
        
        console.log('\n⚠️  CRITICAL: Make sure your OPERATOR_KEY is the RAW private key');
        console.log('    WITHOUT any DER prefix or encoding wrapper!');
    }
}

/**
 * Quick fix implementation for the authentication issue
 */
class HederaQuickFix {
    /**
     * Generate a working version of the createTopic method with better error handling
     */
    static getFixedCreateTopicCode() {
        return `
/**
 * FIXED VERSION - Enhanced createTopic with better authentication handling
 */
async createTopic() {
    return this.retryOperation(async () => {
        logger.info('Creating HCS topic with enhanced authentication...');
        
        // Enhanced client setup with explicit configuration
        const client = Client.forTestnet();
        
        // Parse key with multiple methods
        let operatorKey;
        try {
            operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        } catch (error) {
            console.log('Trying ED25519 parsing...');
            operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);
        }
        
        const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
        
        // Set operator with explicit key
        client.setOperator(operatorId, operatorKey);
        
        // Conservative transaction settings
        client.setDefaultMaxTransactionFee(new Hbar(10)); // Lower fee
        client.setDefaultMaxQueryPayment(new Hbar(1));
        
        // Verify authentication first
        const balance = await client.getAccountBalance(operatorId);
        logger.info(\`Account balance verified: \${balance.hbars.toString()}\`);
        
        // Create topic with minimal configuration first
        const transaction = new TopicCreateTransaction()
            .setTopicMemo("SolarSentinel Test Topic")
            .setMaxTransactionFee(new Hbar(5)); // Even lower fee for testing
            
        // Don't set submit key initially - this might be causing issues
        // .setSubmitKey(operatorKey)  // Comment out temporarily
        
        console.log('Executing topic creation...');
        const response = await transaction.execute(client);
        const receipt = await response.getReceipt(client);
        
        if (receipt.status !== Status.Success) {
            throw new Error(\`Topic creation failed with status: \${receipt.status}\`);
        }
        
        this.topicId = receipt.topicId;
        client.close(); // Clean up
        
        logger.info('HCS topic created successfully', {
            topicId: this.topicId.toString()
        });
        
        return this.topicId.toString();
    }, 'Create HCS Topic');
}`;
    }

    /**
     * Generate a minimal working test
     */
    static getMinimalTest() {
        return `
/**
 * MINIMAL AUTHENTICATION TEST
 * Run this to isolate the authentication issue
 */
const { Client, PrivateKey, AccountId, AccountBalanceQuery } = require('@hashgraph/sdk');
require('dotenv').config();

async function minimalAuthTest() {
    try {
        console.log('Testing basic authentication...');
        
        // Parse credentials
        const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
        let operatorKey;
        
        // Try different key parsing methods
        try {
            operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
            console.log('✅ Key parsed with fromString');
        } catch (e) {
            operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);
            console.log('✅ Key parsed with fromStringED25519');
        }
        
        // Create client
        const client = Client.forTestnet();
        client.setOperator(operatorId, operatorKey);
        
        // Test with simple balance query
        const balance = await client.getAccountBalance(operatorId);
        console.log(\`✅ Authentication successful! Balance: \${balance.hbars.toString()}\`);
        
        client.close();
        return true;
        
    } catch (error) {
        console.log('❌ Authentication failed:', error.message);
        return false;
    }
}

// Run the test
minimalAuthTest().then(success => {
    if (success) {
        console.log('\\n🎉 Authentication works! The issue might be in transaction setup.');
    } else {
        console.log('\\n🚨 Authentication failed. Check your credentials.');
    }
});`;
    }
}

// Export the diagnostic tools
module.exports = { HederaAuthDiagnostics, HederaQuickFix };

// Run diagnostics if executed directly
if (require.main === module) {
    const diagnostics = new HederaAuthDiagnostics();
    diagnostics.runDiagnostics().then(() => {
        console.log('\n🔧 Next Steps:');
        console.log('1. Fix the highest priority issues identified above');
        console.log('2. Use the corrected .env template');
        console.log('3. Try the minimal authentication test');
        console.log('4. If still failing, get new credentials from portal.hedera.com');
        
        process.exit(0);
    }).catch(error => {
        console.error('Diagnostics failed:', error);
        process.exit(1);
    });
}