# Hospital Triage App

## Team Information
**Team members**: Cedric Nadjibé and Lucas Muteta

## Application Overview
The Hospital Triage App provides an intuitive interface for both patients and administrative staff to manage and navigate through the emergency room process. The system helps staff and patients better understand wait times while in the emergency room based on two dimensions: severity of injuries and the length of time already in the queue.

## Key Features

### Patient Features:
- Digital triage form submission
- Real-time wait time tracking
- Priority assessment based on symptoms
- Progress tracking through treatment stages
- Medical history access
- Emergency contact information

### Admin Features:
- Full patient waitlist management
- Priority adjustment controls
- Action logging for all administrative changes
- Real-time patient status updates
- Estimated wait time calculations

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js (for server-side implementation)
- **Database**: SQL-based schema (provided)
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Lato)

## Database Schema
The application uses a relational database with three main entities:

### 1. Patients
Stores patient information from triage forms:
- `patient_id` (PK): Unique identifier
- `code`: 3-letter patient code
- `name`: Full patient name
- `injury_type`: Type/location of injury
- `pain_level`: Numeric pain rating (1-10)
- `arrival_time`: Timestamp of check-in
- `priority_id` (FK): Current triage priority

### 2. Priorities
Defines urgency levels:
- `priority_id` (PK): Unique identifier
- `level_name`: Short label (Low, Medium, High, Critical)
- `description`: Text description
- `color_code`: Hex color for UI
- `estimated_wait_time`: Expected wait in minutes

### 3. Action_Logs
Records admin actions:
- `action_id` (PK): Unique identifier
- `patient_id` (FK): Affected patient
- `action_type`: Type of action performed
- `old_priority_id`: Priority before change
- `new_priority_id`: Priority after change
- `action_timestamp`: When action occurred
- `notes`: Optional admin comments

## Design System

### Colors
- **Primary Blue (#4F8CF7)**: Main buttons, highlights
- **Soft Grey (#D2D2CF)**: Backgrounds, form elements
- **Dark Text (#111111)**: Primary text
- **Critical Red (#B10000)**: Emergency indicators
- **Stable Green (#3CB371)**: Success, low priority
- **Caution Yellow (#FFD700)**: Medium priority
- **Table Header Grey (#E6EEF8)**: Table backgrounds

### Typography
- **Lato Bold**: Headings, buttons, navigation
- **Lato Regular**: Body text, form labels, instructions

### Components
- **Buttons**: Rounded rectangles with consistent hover states
- **Forms**: Clean, accessible inputs with clear validation
- **Tables**: Responsive with priority color coding
- **Modals**: Centered dialogs for important actions
- **Cards**: Information containers with consistent spacing

## Project Structure