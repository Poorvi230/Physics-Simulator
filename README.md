# 🚀 Physics Simulator

I built this because staring at flat, boring physics textbooks wasn't it. It started as a tiny project inspired by 11th-standard kinematics just to see a projectile actually move, but I ended up hyperfocusing and grinding for 20+ hours (mostly debugging).
Now it’s a full dual-engine simulator that handles **Projectile Motion** and **Simple Harmonic Motion (SHM)** with real-time vector math.

👉 **[Launch the Live Simulator](https://poorvi230.github.io/Physics-Simulator/)**

---

## 📸 Evolution of the Project

### The Final Build
The fully optimized dashboard featuring custom environmental constants, atmospheric drag, crosswinds, different visual themes, and an active vector overlay system.

| Final Projectile Tracker | Pendulum FBD Engine (Live Vector Arrows) |
| --- | --- |
| ![Final Projectile Build](Preview7.png) | ![Final Pendulum FBD Engine](Preview6.png) |

### How It Started vs. How It Went
Tthe development phases- from basic canvas plots to managing frequency waves and custom UI themes. 

| Phase 1: Core Trajectory | Phase 2: Testing the Neon Theme | Phase 3: SHM Wave Testing |
| --- | --- | --- |
| ![Initial Plotting](Preview3.png) | ![Neon Theme Trial](Preview1.png) | ![SHM Frequency Plots](Preview5.png) |

> ⚠️ **Debugging Note on Phase 3:** This phase was where the code went completely bonkers. Most of the development time was spent right here trying to debug the canvas rendering engine because it kept overlaying the old projectile coordinate lines underneath the active spring harmonic waves.

*(Testing boundary limits: a high-altitude trajectory simulated under the Moon's gravitational constant).*
![High Altitude Moon Launch Trial](Preview4.png)

---

## 🎨 Core Features

* **🏹 Track A: Projectile Motion Engine**
  * Sliders to tweak Velocity, Launch Angle, and Initial Height on the fly.
  * Environmental variables like Gravity presets (Earth, Moon, Space), Air Resistance, and Crosswinds.
  * Live stats tracking Max Height, Total Flight Time, and Horizontal Range.

* **🌀 Track B: Simple Harmonic Motion (SHM) Engine**
  * **Linear Mode:** Generates a clean, isolated Displacement vs. Time sine wave graph tracking boundaries from $-A \to +A$.
  * **Angular Mode:** Simulates a mathematically precise swinging pendulum anchored to a top-center pivot point.
  * **Free Body Diagram (FBD) Overlay:** A toggle that draws live, color-coded force vectors directly from the center of the moving bob showing **Gravity ($F_g$)**, **Tension ($T$)**, and **Net Restoring Force ($F_{\text{net}}$)**.

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

## Inspiration
- 11th Grade Physics Textbook
  
---

## Future Work

Future development plans include:
* Expanding the dashboard to include a wider variety of experiments (like wave optics or circular motion mechanics).
* Upgrading the UI/UX layout to for more smoother and interactive experience.

---

### 🎨 Creative Corner
I also dedicated around 3 hours to making artwork which has always been a piece of me, you'll be seeing more in projects ahead!

| Art Concept 1 | Art Concept 2 |
| --- | --- |
| ![Art Concept 1](art1.jpeg) | ![Art Concept 2](art2.jpeg) |

---

## 📝 License
This project is open-source under the [MIT License](LICENSE).
Mess around however u like!

---
Built with a great deal of effort. Hope you like it!
