# 🚀 Physics Simulator

An interactive web dashboard built to take physics out of static textbooks and bring them to life. I initially just wanted to see projectile move. But as I kept working on it, it turned into a massive 20+ hour project where I ended up working around two entirely separate simulation engines: one for Projectile Motion and another for Simple Harmonic Motion (SHM).

👉 **[Launch the Live Simulator](https://poorvi230.github.io/Physics-Simulator/)**

---

## 📸 Evolution of the Project

### The Final Build
The fully optimized dashboard featuring custom environmental constants, atmospheric drag, crosswinds, different visual themes, and an active vector overlay system.

| Final Projectile Tracker | Pendulum FBD Engine (Live Vector Arrows) |
| --- | --- |
| ![Final Projectile Build](Preview7.png) | ![Final Pendulum FBD Engine](Preview6.png) |

### How It Started vs. How It Went
A look through the development phases, from basic canvas plots to managing frequency waves and custom UI themes. 

| Phase 1: Core Trajectory | Phase 2: Testing the Neon Theme | Phase 3: SHM Wave Testing |
| --- | --- | --- |
| ![Initial Plotting](Preview3.png) | ![Neon Theme Trial](Preview1.png) | ![SHM Frequency Plots](Preview5.jpg) |

> ⚠️ **Debugging Note on Phase 3:** This phase was where the code went completely bonkers. Most of the development time was spent right here trying to debug the canvas rendering engine because it kept overlaying the old projectile coordinate lines underneath the active spring harmonic waves.

*(Testing boundary limits: a high-altitude trajectory simulated under the Moon's gravitational constant).*
![High Altitude Moon Launch Trial](Preview4.png)

---

## 🎨 Core Features

* **🏹 Track A: Projectile Motion Engine**
  * Live configuration sliders for Velocity, Launch Angle, and Initial Height.
  * Environmental variables including Gravity presets (Earth, Moon, Space), Air Resistance, and Crosswinds.
  * Real-time telemetry readouts tracking Max Height, Total Flight Time, and Horizontal Range.

* **🌀 Track B: Simple Harmonic Motion (SHM) Engine**
  * **Linear Mode:** It generates a clean, isolated Displacement vs. Time sine wave graph tracking boundaries from $-A \to +A$.
  * **Angular Mode:** Simulates a mathematically precise swinging pendulum anchored to a top-center pivot point.
  * **Free Body Diagram (FBD) Overlay:** A real-time toggle drawing dynamic, color-coded force vectors directly from the center of the moving bob: **Gravity ($F_g$)**, **Tension ($T$)**, and **Net Restoring Force ($F_{\text{net}}$)**.

---

## 🧮 The Math Pipeline

The pendulum engine calculates true physical states frame-by-frame ($\Delta t = 0.016\text{s}$) rather than relying on basic linear approximations:

1. **Angular Acceleration ($\alpha$):**
   $$\alpha = -\frac{g}{L} \sin(\theta)$$
2. **State Updates:**
   $$\omega_{\text{new}} = \omega_{\text{old}} + \alpha \cdot \Delta t$$
   $$\theta_{\text{new}} = \theta_{\text{old}} + \omega_{\text{new}} \cdot \Delta t$$
3. **Canvas Geometric Mapping:**
   $$x_{\text{bob}} = x_0 + L \cdot \sin(\theta) \cdot \text{scaleFactor}$$
   $$y_{\text{bob}} = y_0 + L \cdot \cos(\theta) \cdot \text{scaleFactor}$$

---

## 🔮 Future Work

Future development plans include:
* Expanding the dashboard to include a wider variety of physics experiments (such as wave optics or circular motion mechanics).
* Refining and upgrading the UI/UX layout to provide an even smoother, more accessible user experience.

---

## 📝 License
This project is open-source under the [MIT License](LICENSE).

---
Built with a great deal of effort. Hope you like it!
