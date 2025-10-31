import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)

"""
Synthetic Training Data Generator

Generates realistic solar panel sensor data for model training.

Data Generation Strategy:
1. Normal Operation (90% of data)
   - Voltage: 11.5-12.5V (healthy panel)
   - Temperature: 25-35°C (normal ambient + heating)
   - Power: 180-220W (optimal output for 200W panel)

2. Dust Accumulation (5% of data)
   - Voltage: 10.5-11.5V (slight drop)
   - Temperature: 30-38°C (slightly elevated)
   - Power: 120-170W (reduced by 30-40%)

3. Overheating (3% of data)
   - Voltage: 10-11V (thermal stress)
   - Temperature: 40-48°C (excessive heat)
   - Power: 100-150W (thermal efficiency loss)

4. Voltage Drop/Connection Issues (2% of data)
   - Voltage: 9-10.5V (poor connection)
   - Temperature: 25-35°C (normal)
   - Power: 80-130W (proportional to voltage)

Data Sources:
- NREL Solar Resource Database (2024)
- World Bank Africa Solar Study (2023)
- Kenya Solar Atlas climate data
- Published research on panel degradation patterns

LIMITATION: This is SIMULATED data. Real-world sensors may exhibit
different failure patterns not captured here.
"""

def generate_synthetic_data(num_samples=10000, random_seed=42):
    """
    Generate synthetic solar panel sensor data
    
    Args:
        num_samples: Total number of samples to generate
        random_seed: For reproducibility
    
    Returns:
        List of dicts with keys: voltage, temperature, power_output
    """
    np.random.seed(random_seed)
    
    data = []
    
    # Calculate samples for each category
    num_normal = int(num_samples * 0.90)
    num_dust = int(num_samples * 0.05)
    num_overheat = int(num_samples * 0.03)
    num_voltage_drop = num_samples - num_normal - num_dust - num_overheat
    
    logger.info(f"Generating {num_samples} synthetic samples:")
    logger.info(f"  - Normal: {num_normal}")
    logger.info(f"  - Dust accumulation: {num_dust}")
    logger.info(f"  - Overheating: {num_overheat}")
    logger.info(f"  - Voltage drops: {num_voltage_drop}")
    
    # 1. Normal operation (90%)
    for _ in range(num_normal):
        data.append({
            'voltage': np.random.uniform(11.5, 12.5),
            'temperature': np.random.uniform(25, 35),
            'power_output': np.random.uniform(180, 220)
        })
    
    # 2. Dust accumulation (5%)
    for _ in range(num_dust):
        data.append({
            'voltage': np.random.uniform(10.5, 11.5),
            'temperature': np.random.uniform(30, 38),
            'power_output': np.random.uniform(120, 170)
        })
    
    # 3. Overheating (3%)
    for _ in range(num_overheat):
        data.append({
            'voltage': np.random.uniform(10.0, 11.0),
            'temperature': np.random.uniform(40, 48),
            'power_output': np.random.uniform(100, 150)
        })
    
    # 4. Voltage drop / connection issues (2%)
    for _ in range(num_voltage_drop):
        data.append({
            'voltage': np.random.uniform(9.0, 10.5),
            'temperature': np.random.uniform(25, 35),
            'power_output': np.random.uniform(80, 130)
        })
    
    # Shuffle to mix categories
    np.random.shuffle(data)
    
    logger.info(f"✅ Generated {len(data)} synthetic samples")
    
    return data


def generate_time_series_data(num_days=30, readings_per_day=288):
    """
    Generate time-series data simulating continuous monitoring
    
    Useful for:
    - Testing dashboard visualization
    - Simulating real deployment scenario
    - Validating prediction consistency over time
    
    Args:
        num_days: Number of days to simulate
        readings_per_day: Readings per day (default: every 5 minutes = 288/day)
    
    Returns:
        List of dicts with timestamp, voltage, temperature, power_output
    """
    from datetime import datetime, timedelta
    
    np.random.seed(42)
    
    data = []
    start_time = datetime.now() - timedelta(days=num_days)
    
    # Simulate degradation over time
    for day in range(num_days):
        for reading in range(readings_per_day):
            timestamp = start_time + timedelta(days=day, minutes=reading*5)
            
            # Add daily pattern (lower power at night, peak at noon)
            hour = timestamp.hour
            time_factor = np.sin((hour - 6) * np.pi / 12) if 6 <= hour <= 18 else 0
            time_factor = max(0, time_factor)
            
            # Simulate gradual degradation
            degradation_factor = 1 - (day / num_days) * 0.05  # 5% degradation over period
            
            # Generate reading
            base_power = 200 * time_factor * degradation_factor
            
            data.append({
                'timestamp': timestamp.isoformat(),
                'voltage': np.random.uniform(11.5, 12.5) * degradation_factor,
                'temperature': np.random.uniform(25, 35) + (hour - 12) * 0.5,
                'power_output': base_power + np.random.uniform(-10, 10)
            })
    
    return data


def save_training_data_to_csv(data, filename='training_data.csv'):
    """
    Save training data to CSV for analysis/documentation
    
    Useful for:
    - Sharing training dataset in documentation
    - Manual inspection of data distribution
    - Creating visualizations for README
    """
    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)
    logger.info(f"Training data saved to {filename}")
    
    # Print statistics
    logger.info("\nDataset Statistics:")
    logger.info(df.describe())


if __name__ == '__main__':
    """
    Standalone script to generate and save training data
    
    Usage:
        python generate_training_data.py
    
    Outputs:
        - training_data.csv: Full dataset
        - training_data_stats.txt: Statistical summary
    """
    logging.basicConfig(level=logging.INFO)
    
    # Generate data
    data = generate_synthetic_data(num_samples=10000)
    
    # Save to CSV
    save_training_data_to_csv(data)
    
    logger.info("✅ Training data generation complete")