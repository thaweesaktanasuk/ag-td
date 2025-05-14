#!/usr/bin/env python3
"""
Simple Railway Simulation Demo
This demonstrates a basic train movement simulation
"""
import os
import sys
import time
import random
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

def simulate_train_movement(train_id, distance, speed_kmh, delay_probability=0.05):
    """Simulate a train moving along a track with possible delays"""
    print(f"Train {train_id}: Simulation started - Distance: {distance}km, Speed: {speed_kmh}km/h")
    
    # Convert km/h to km/s for simulation
    speed_kms = speed_kmh / 3600
    
    # Initialize position and time
    position = 0
    elapsed_time = 0
    positions = []
    times = []
    
    # Simulate until train reaches destination
    while position < distance:
        # Random delay (signal issues, station stops, etc.)
        if random.random() < delay_probability:
            delay = random.uniform(10, 60)  # Delay between 10-60 seconds
            print(f"Train {train_id}: Delay of {delay:.1f} seconds at position {position:.2f}km")
            elapsed_time += delay
        
        # Normal movement for 1 minute
        time_step = 60  # 1 minute in seconds
        position += speed_kms * time_step
        elapsed_time += time_step
        
        # Record for plotting
        positions.append(min(position, distance))
        times.append(elapsed_time / 60)  # Convert to minutes for plotting
    
    # Final report
    total_time_minutes = elapsed_time / 60
    print(f"Train {train_id}: Reached destination in {total_time_minutes:.2f} minutes")
    print(f"Train {train_id}: Average speed: {distance/(elapsed_time/3600):.2f}km/h")
    
    return positions, times

def plot_train_movement(train_data):
    """Plot the movement of multiple trains"""
    plt.figure(figsize=(10, 6))
    
    for train_id, (positions, times) in train_data.items():
        plt.plot(times, positions, label=f"Train {train_id}")
    
    plt.xlabel("Time (minutes)")
    plt.ylabel("Distance (km)")
    plt.title("Railway Traffic Simulation")
    plt.grid(True)
    plt.legend()
    
    # Save the plot
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"simulation_result_{timestamp}.png"
    plt.savefig(filename)
    print(f"Simulation plot saved as {filename}")
    
    # Show the plot if not in CI environment
    if os.environ.get('CI') != 'true':
        plt.show()

def main():
    """Run a simulation with multiple trains"""
    print("=== Railway Traffic Simulation ===")
    print(f"Configuration path: {os.environ.get('RAILWAY_CONFIG_PATH', 'Not set')}")
    print(f"Simulation version: {os.environ.get('RAILWAY_SIM_VERSION', 'Not set')}")
    
    # Simulate multiple trains
    train_data = {}
    
    # Express train
    train_data[1] = simulate_train_movement(
        train_id=1, 
        distance=100,  # 100 km route
        speed_kmh=120,  # 120 km/h
        delay_probability=0.02  # Low delay probability
    )
    
    # Local train with more stops
    train_data[2] = simulate_train_movement(
        train_id=2, 
        distance=100,  # Same route
        speed_kmh=80,  # Slower speed
        delay_probability=0.1  # More frequent stops/delays
    )
    
    # Plot the results
    plot_train_movement(train_data)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
