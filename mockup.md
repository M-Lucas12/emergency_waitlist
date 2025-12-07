# Hospital Triage App Design Document

## Team Information
**Team members**: Cedric Nadjibé and Lucas Muteta

## Design Overview
The Hospital Triage App provides an intuitive interface for both patients and administrative staff to manage and navigate through the emergency room process. The design focuses on ease of use, accessibility, and efficiency in high-pressure emergency situations.

## Fonts
- **Lato Bold**: Utilized for all headings, button labels, and high-visibility interface elements. Its smooth, semi-rounded letterforms provide a modern and approachable look while maintaining excellent readability across mobile and desktop screens.
- **Lato Regular**: Employed for all body text, instructions, form descriptions, and patient questionnaire content. The balanced proportions and open counters of Lato create a comfortable reading experience.

## Color Palette

### User Interface (Patient-Facing):
- **Calming Light Blue (#4F8CF7)**: Primary buttons and highlights to create a reassuring, friendly environment
- **Soft Grey (#D2D2CF)**: Backgrounds and form elements to minimize visual strain
- **Dark Text (#111111)**: High contrast for readability across all ages and devices
- **White (#FFFFFF)**: Clean background for content areas

### Admin Interface (Staff-Facing):
- **Clean Neutral White (#FFFFFF)**: Maximum clarity for data-heavy screens
- **Table Header Grey (#E6EEF8)**: Subtle separation for structure and scanning
- **Critical Red (#B10000)**: Exclusive use for critical triage levels and emergency indicators
- **Stable Green (#3CB371)**: Signals successful actions and stable patient status
- **Caution Yellow (#FFD700)**: Communicates caution and medium priority levels

## App Components

### Titles
- "Grey Sloan Memorial - Patient Portal" for patient interface
- "Grey Sloan Memorial - Admin Dashboard" for administrative interface
- Displayed prominently using Lato Bold

### Buttons
- Rectangular with rounded edges (8px border radius)
- Consistent sizing: Small (btn-sm), Medium (default), Large (btn-lg)
- Clear hover, active, and disabled states
- Color-coded by function:
  - Primary: Calming Blue (#4F8CF7)
  - Danger: Critical Red (#B10000)
  - Success: Stable Green (#3CB371)
  - Warning: Caution Yellow (#FFD700)
  - Outline: Transparent with blue border

### Input Fields
- Clean, outlined fields with ample padding for comfort
- Placeholder text provides clear examples
- Responsive design that adapts to mobile and desktop layouts
- Validation states with clear error messaging

### Patient Questionnaire
- Structured, easy-to-complete form collecting:
  - Patient Name
  - 3-Letter Code
  - Injury Type (dropdown selection)
  - Pain Level (1-10 with visual slider)
  - Emergency Symptoms Checklist
- Visually grouped with consistent spacing using CSS Grid
- Prioritizes clarity, speed, and accessibility

### Admin Dashboard
- Professionally arranged dashboard with Grey Sloan Memorial branding
- Key components:
  - Patient waitlist table with sortable columns
  - Color-coded priority indicators
  - Estimated wait times
  - Selected patient details panel
  - Action log history
  - Priority adjustment controls
- Layout emphasizes efficient triage management and quick decision-making

## Layout and Navigation
- Responsive, grid-based layout that adapts to all devices
- Mobile-first approach ensuring usability in fast-moving emergency situations
- Consistent navigation patterns:
  - Mobile: Fixed bottom navigation bar within thumb reach
  - Desktop: Structured top navigation bar with clear section organization
- Breadcrumb trails for multi-step processes

## Consistency Principles
- Shared component library (buttons, cards, forms, modals, alerts)
- Consistent color palette across all interfaces
- Identical header/navigation layout on all pages
- Standardized spacing and alignment (using CSS custom properties)
- Unified typography scale

## Component Integration
- **Patient Portal**: All interface elements (titles, forms, navigation) integrated within a clear, organized structure designed for quick data entry
- **Admin Portal**: Dashboard combines waitlist management, patient details, and action controls in an efficient workflow
- **Shared Components**: Common elements like modals, alerts, and form controls reused across both interfaces

## Functionality Highlights
- Real-time wait time updates
- Priority calculation based on pain level and symptoms
- Action logging for audit trails
- Responsive design for mobile, tablet, and desktop
- Accessible interface (WCAG 2.1 AA compliance)
- Emergency protocol activation
- Guest access for quick triage submission

## Responsive Breakpoints
- **Mobile**: 0-768px (vertical layout, bottom navigation)
- **Tablet**: 769px-1024px (adaptive grid layouts)
- **Desktop**: 1025px+ (full dashboard, side-by-side panels)

## Accessibility Features
- Sufficient color contrast (minimum 4.5:1)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators for interactive elements
- Alternative text for icons and images
- Resizable text without breaking layout