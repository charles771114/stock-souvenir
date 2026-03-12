# Stock Souvenir - Design Context

Established via `teach-impeccable` process.

## Design Context

### Users
- **Primary Goal**: Tracking and planning stock souvenir purchases ("購股入袋清單").
- **Mental Model**: A funnel of ownership - from "Tracking" (Interest) to "Owned" (Achievement).
- **Core Need**: Immediate clarity on what needs action (Last Buy Dates) vs. what is already secured.

### Brand Personality
- **Voice & Tone**: Professional yet Delightful ("Pro Max" quality).
- **3-Word Personality**: **Elegant**, **Efficient**, **Achievement-oriented**.
- **Emotional Goals**: Control (over deadlines), Achievement (collecting souvenirs), and Modernity (high-end UI).

### Aesthetic Direction
- **Visual Tone**: Modern, Clean, and Premium.
- **Key Elements**: 
  - **Glassmorphism**: Extensive use of backdrop-blur and semi-transparent surfaces.
  - **OKLCH Colors**: Perceptually uniform and sophisticated palette (Indigo-Slate & Heritage Gold).
  - **Staggered Animations**: Smooth `fadeInUp` and `bounceSubtle` transitions for a lifelike feel.
- **Theme**: Dark Mode must be a first-class citizen (Deep Slate / Surface 950).

### Design Principles
1. **Tracking First**: The interface must prioritize "Planned/Tracking" items above all else. Secondary info should not compete for attention.
2. **Actionable Urgency**: Use color-coded countdowns and clear indicators for items approaching "Last Buy Date".
3. **Achievement Visuals**: Owned items (Inventory) should have a distinct, visually rewarding style that feels like an "Unlocked" state.
4. **Zero Fallback**: Decisions should be absolute. Removing from inventory results in a clean slate ("None" state), keeping the mental model simple.
5. **Vertical Harmony**: Maintain a consistent vertical rhythm and spacing (`--space-unit`) to ensure scannability.
