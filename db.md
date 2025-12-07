# Hospital Triage Database Design Documentation

## Entities Description

### Patients 
The patient entity stores all the information entered from the triage form and used in the admin waitlist.
Each record represents a single triage submission for one patient, including injury type, pain level, and assigned priority level.

### Priorities 
The priority entity defines the different urgency levels used in the system (for example the red/yellow/green states visible in the admin UI).
It stores a human-readable description, a color used in the interface, and an estimated wait time for each level.

### Action_Logs 
The action entity records every action that an admin performs on a patient from the admin dashboard.
It allows the system to keep a history of changes (e.g., a patient's attention level has been increased, a patient being removed from the queue).

## Attributes Specification

### Patient Attributes:
- `patient_id` (integer): Unique patient identifier for each record 
- `code` (varchar): A three-letter code that identifies the patient in the UI. 
- `name` (varchar): The full name of the patient 
- `injury_type` (varchar): The region of the body or the injury type selected from the form (e.g., "Head", "Chest", "Abdomen", "Neck", "Back", "Arm or Leg").
- `pain_level` (integer): A numeric pain rating from 1 to 10, where 1 is "not bad" and 10 is "unbearable".
- `arrival_time` (timestamp): The date and time when the patient submitted their triage form and entered the queue.
- `priority_id` (integer): The current triage priority level assigned to this patient.  
  This value can change over time when admins increase or decrease attention.

### Priorities Attributes:
- `priority_id` (integer, PK): A unique identifier for each priority level.
- `level_name` (varchar): A short label for the priority level  
  (e.g., "Low", "Medium", "High", "Critical").
- `description` (varchar): Text description of when this priority level should be used  
  (e.g., "Non-urgent", "Requires attention within 30 minutes").
- `color_code` (varchar): Hex color used in the UI to represent this level  
  (e.g., #3CB371 for stable patients, #FFD700 for caution, #B10000 for critical).
- `estimated_wait_time` (integer): Expected waiting time in minutes for patients at this level.  
  This supports the "Wait Time" column displayed in the admin dashboard.

### Action_Logs Attributes:
- `action_id` (integer, PK): A unique identifier for each logged admin action.
- `patient_id` (integer): The patient affected by this action.
- `action_type` (varchar): The type of action performed. Typical values:
    - "Increase Attention"
    - "Decrease Attention"
    - "Remove Patient"
- `old_priority_id` (integer, nullable): The priority level before the change (if applicable).
- `new_priority_id` (integer, nullable): The priority level after the change (if applicable).
- `action_timestamp` (timestamp): Date and time when the action was executed.
- `notes` (varchar, nullable): Optional free-text comments by the admin (e.g., "doctor requested escalation").

## Entity Relationships

The ERD illustrates the relationships between the entities in the Grey Sloan Memorial triage system. The Patients entity is linked to the Priorities entity through a foreign key that defines each patient's current urgency level, and it connects to the Action_Logs entity to record all administrative actions performed on that patient throughout the triage process.

### Relationship Summary:
1. **Patient → Priorities**: Many-to-One relationship
   - A patient has one current priority level
   - A priority level can be assigned to many patients

2. **Patient → Action_Logs**: One-to-Many relationship
   - A patient can have many action logs
   - An action log belongs to only one patient

## Sample Data

### Priorities Table:
| priority_id | level_name | description | color_code | estimated_wait_time |
|-------------|------------|-------------|------------|---------------------|
| 1 | Critical | Life-threatening, immediate attention required | #B10000 | 0 |
| 2 | High | Serious condition, attention within 15 minutes | #FF4444 | 15 |
| 3 | Medium | Stable but requires medical attention | #FFD700 | 30 |
| 4 | Low | Non-urgent, can wait | #3CB371 | 60 |