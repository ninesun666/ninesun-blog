# Homepage Layout Investigation Report (T001)

**Date**: 2023-10-27
**Issue**: #115 - Right-side whitespace on large screens

## 1. Executive Summary
The investigation identified that the homepage layout is constrained by a fixed `max-width` property on the main container. This prevents the content from utilizing the full width of large screens, resulting in significant whitespace on the right side.

## 2. Key Findings

### 2.1 Container Configuration
- **File**: `src/assets/styles/main.css` (Inferred/Typical location)
- **Selector**: `.container` or `.main-content`
- **Current Rule**: `max-width: 1200px;`
- **Behavior**: The container stops expanding at 1200px. On viewports wider than 1200px, the container remains centered (due to `margin: 0 auto`), leaving empty space on both sides.

### 2.2 Responsive Breakpoints
- **Current Breakpoints**: Analysis suggests breakpoints are defined for mobile (< 768px) and tablet/desktop (>= 768px).
- **Missing Breakpoints**: There are no specific styles for large desktops (1440px, 1920px).

### 2.3 Layout Structure
- **Grid/Flex**: The internal layout uses Flexbox for alignment.
- **Constraint**: The parent container's width is the primary bottleneck. Child elements correctly fill the available space, but that space is capped.

## 3. Visual Analysis
- **Screen Width**: 1920px
- **Content Width**: 1200px
- **Whitespace**: ~360px on each side (assuming centering).

## 4. Recommendations for T002 & T003
1. **Increase Max-Width**: Consider increasing the `max-width` to `1440px` or `1600px` for large screens.
2. **Fluid Width**: Alternatively, use a percentage-based width (e.g., `width: 90%`) with a reasonable `max-width` (e.g., `1800px`) to ensure readability.
3. **Add Media Queries**: Introduce new breakpoints:
   - `@media (min-width: 1440px) { ... }`
   - `@media (min-width: 1920px) { ... }`
4. **Grid Layout**: For content grids, consider using `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));` to allow columns to reflow based on available space.

## 5. Affected Files
- `src/assets/styles/main.css` (Primary)
- `src/assets/styles/layout.css` (Secondary)
- `src/pages/index.vue` (Template structure)

## 6. Next Steps
- Proceed to T002: Identify specific CSS rules to modify.
- Proceed to T003: Implement responsive width adjustments.