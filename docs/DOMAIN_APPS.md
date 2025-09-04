# AfyaPapo Domain Applications

This document provides comprehensive documentation for all 8 domain applications in the AfyaPapo emergency response system.

## Table of Contents

1. [Users App](#1-users-app)
2. [Hospitals App](#2-hospitals-app)
3. [Incidents App](#3-incidents-app)
4. [Responders App](#4-responders-app)
5. [Assignments App](#5-assignments-app)
6. [Communications App](#6-communications-app)
7. [Ambulances App](#7-ambulances-app)
8. [Geospatial App](#8-geospatial-app)

---

## 1. Users App (`users/`)

**Purpose:** User management, authentication, and profiles for Tanzania's emergency response system.

### Core Models

#### `User` Model
```python
class User(AbstractUser):
    # Core identification
    id = UUIDField(primary_key=True)
    phone_number = PhoneNumberField()  # Primary auth for citizens
    user_type = CharField(choices=[
        ('citizen', 'Citizen'), 
        ('responder', 'Responder'), 
        ('admin', 'Admin'), 
        ('dispatcher', 'Dispatcher')
    ])
    
    # Tanzania-specific
    preferred_language = CharField(choices=[('en', 'English'), ('sw', 'Kiswahili')])
    verification_status = CharField(choices=[
        ('unverified', 'Unverified'), 
        ('phone_verified', 'Phone Verified'), 
        ('fully_verified', 'Fully Verified')
    ])
    
    # Security
    is_phone_verified = BooleanField(default=False)
    login_attempts = PositiveIntegerField(default=0)
    account_locked_until = DateTimeField(null=True)
```

#### `UserProfile` Model
```python
class UserProfile(Model):
    user = OneToOneField(User)
    full_name = CharField(max_length=255)
    national_id_number = CharField(max_length=20, unique=True)  # Tanzania NIN
    date_of_birth = DateField()
    gender = CharField(choices=[('M', 'Male'), ('F', 'Female')])
    
    # Health information for emergencies
    blood_type = CharField(choices=['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    medical_conditions = TextField(blank=True)
    medications = TextField(blank=True)
    allergies = TextField(blank=True)
    
    # Insurance
    health_insurance_provider = CharField(max_length=100, blank=True)
    health_insurance_number = CharField(max_length=50, blank=True)
    
    # Location
    region = CharField(max_length=50)
    district = CharField(max_length=50)
    address = TextField()
```

#### `PhoneVerification` Model
```python
class PhoneVerification(Model):
    user = ForeignKey(User)
    phone_number = PhoneNumberField()
    otp_code = CharField(max_length=6)
    otp_hash = CharField(max_length=64)  # SHA-256 hash
    
    verification_type = CharField(choices=[
        ('registration', 'Registration'), 
        ('login', 'Login'), 
        ('password_reset', 'Password Reset')
    ])
    
    expires_at = DateTimeField()
    is_verified = BooleanField(default=False)
    attempts = PositiveIntegerField(default=0)
    max_attempts = PositiveIntegerField(default=3)
```

### Key Features
- **Phone-based Authentication**: Primary authentication via phone numbers
- **National ID Validation**: Tanzania NIN verification
- **Emergency Health Data**: Medical information accessible during emergencies
- **Multi-language Support**: English and Swahili preferences
- **Security Controls**: Account lockout, attempt tracking

### Services

#### `UserRegistrationService`
```python
class UserRegistrationService:
    @staticmethod
    def register_citizen(registration_data):
        """Register new citizen user with phone verification"""
        # 1. Validate phone number format
        # 2. Check if user already exists
        # 3. Create user account
        # 4. Send OTP via Twilio
        # 5. Create verification record
        
    @staticmethod
    def verify_phone_number(phone_number, otp_code):
        """Verify phone number with OTP"""
        # 1. Find verification record
        # 2. Validate OTP code
        # 3. Check expiration
        # 4. Update user verification status
        # 5. Generate JWT tokens
```

---

## 2. Hospitals App (`hospitals/`)

**Purpose:** Medical facility management and hospital administration.

### Core Models

#### `FacilityType` Model
```python
class FacilityType(Model):
    name = CharField(max_length=100, unique=True)
    category = CharField(choices=[
        ('hospital', 'Hospital'),
        ('health_center', 'Health Center'),
        ('dispensary', 'Dispensary'),
        ('clinic', 'Clinic')
    ])
    
    # Capabilities
    has_emergency_room = BooleanField(default=False)
    has_surgery = BooleanField(default=False)
    has_icu = BooleanField(default=False)
    has_maternity = BooleanField(default=False)
    service_level = PositiveIntegerField(help_text="1-5 scale")
```

#### `Facility` Model
```python
class Facility(Model):
    name = CharField(max_length=200)
    facility_type = ForeignKey(FacilityType)
    registration_number = CharField(max_length=50, unique=True)
    
    # Location
    region = ForeignKey('geospatial.Region')
    district = ForeignKey('geospatial.District')
    location_latitude = DecimalField(max_digits=10, decimal_places=7)
    location_longitude = DecimalField(max_digits=10, decimal_places=7)
    address = TextField()
    
    # Capacity
    bed_capacity = PositiveIntegerField()
    emergency_beds = PositiveIntegerField()
    icu_beds = PositiveIntegerField()
    current_occupancy = PositiveIntegerField(default=0)
    
    # Contact Information
    phone_number = PhoneNumberField()
    emergency_phone = PhoneNumberField()
    email = EmailField(blank=True)
    
    # Status
    is_active = BooleanField(default=True)
    accepts_emergencies = BooleanField(default=True)
```

#### `BedManagement` Model
```python
class BedManagement(Model):
    facility = ForeignKey(Facility)
    department = ForeignKey(Department, null=True, blank=True)
    
    bed_number = CharField(max_length=20)
    bed_type = CharField(choices=[
        ('general', 'General Ward'),
        ('emergency', 'Emergency'),
        ('icu', 'Intensive Care'),
        ('maternity', 'Maternity'),
        ('pediatric', 'Pediatric')
    ])
    
    status = CharField(choices=[
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Under Maintenance'),
        ('reserved', 'Reserved')
    ])
    
    # Equipment capabilities
    has_oxygen = BooleanField(default=False)
    has_ventilator = BooleanField(default=False)
    has_monitoring = BooleanField(default=False)
    
    # Patient information (if occupied)
    patient_age_estimate = PositiveIntegerField(null=True, blank=True)
    admission_type = CharField(max_length=50, blank=True)
    estimated_discharge = DateTimeField(null=True, blank=True)
```

### Key Features
- **Real-time Bed Tracking**: Live bed availability and occupancy
- **Equipment Management**: Medical equipment and supply inventory
- **Multi-level Administration**: Hospital administrators with different access levels
- **Emergency Capabilities**: Track emergency room and ICU capacity

---

## 3. Incidents App (`incidents/`)

**Purpose:** Emergency incident creation, tracking, and timeline management.

### Core Models

#### `Incident` Model
```python
class Incident(Model):
    # Core identification
    id = UUIDField(primary_key=True)
    incident_number = CharField(max_length=20, unique=True)  # AFYA-YYYY-NNNNNN
    
    # Reporter information
    reporter = ForeignKey(User)
    reporter_phone = PhoneNumberField()
    
    # Emergency classification
    incident_type = CharField(choices=[
        ('medical', 'Medical Emergency'),
        ('accident', 'Traffic/Road Accident'),
        ('cardiac', 'Cardiac Arrest'),
        ('breathing', 'Breathing Difficulty'),
        ('bleeding', 'Severe Bleeding'),
        ('childbirth', 'Emergency Childbirth'),
        ('unconscious', 'Unconscious Person'),
        ('other', 'Other Emergency')
    ])
    
    severity = CharField(choices=[
        ('critical', 'Critical (Life Threatening)'),
        ('high', 'High Priority'),
        ('medium', 'Medium Priority'),
        ('low', 'Low Priority')
    ])
    
    status = CharField(choices=[
        ('created', 'Emergency Created'),
        ('dispatching', 'Finding Responders'),
        ('assigned', 'Responder Assigned'),
        ('en_route', 'Responder En Route'),
        ('on_scene', 'Responder On Scene'),
        ('treatment', 'Treatment in Progress'),
        ('transporting', 'Patient Being Transported'),
        ('resolved', 'Emergency Resolved'),
        ('cancelled', 'Cancelled')
    ])
    
    # Location information (PostGIS)
    location = PointField()  # GPS coordinates
    location_accuracy_meters = PositiveIntegerField(null=True)
    address_description = TextField()
    
    # Emergency details
    description = TextField()
    symptoms = TextField(blank=True)
    
    # Patient information
    patient_count = PositiveIntegerField(default=1)
    patient_age_estimate = PositiveIntegerField(null=True, blank=True)
    patient_gender = CharField(choices=[('M', 'Male'), ('F', 'Female'), ('U', 'Unknown')])
    patient_conscious = BooleanField(null=True)
    patient_breathing = BooleanField(null=True)
    
    # Resource requirements
    ambulance_needed = BooleanField(default=False)
    specialized_equipment_needed = TextField(blank=True)
    
    # Metadata
    source_platform = CharField(choices=[
        ('mobile_app', 'Mobile App'),
        ('ussd', 'USSD'),
        ('voice_call', 'Voice Call'),
        ('web', 'Web Portal')
    ])
    
    # Timestamps
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### `IncidentTimeline` Model
```python
class IncidentTimeline(Model):
    incident = ForeignKey(Incident, related_name='timeline')
    
    event_type = CharField(choices=[
        ('created', 'Incident Created'),
        ('triaged', 'Incident Triaged'),
        ('responder_assigned', 'Responder Assigned'),
        ('responder_accepted', 'Assignment Accepted'),
        ('responder_declined', 'Assignment Declined'),
        ('responder_en_route', 'Responder En Route'),
        ('responder_arrived', 'Responder Arrived'),
        ('treatment_started', 'Treatment Started'),
        ('ambulance_requested', 'Ambulance Requested'),
        ('ambulance_arrived', 'Ambulance Arrived'),
        ('transport_started', 'Transport Started'),
        ('hospital_arrived', 'Arrived at Hospital'),
        ('handover_completed', 'Handover Completed'),
        ('resolved', 'Incident Resolved')
    ])
    
    description = TextField()
    updated_by = ForeignKey(User)
    updated_by_role = CharField(choices=[
        ('citizen', 'Citizen'),
        ('responder', 'Responder'),
        ('dispatcher', 'Dispatcher'),
        ('system', 'System')
    ])
    
    # Location when update was made
    location = PointField(null=True, blank=True)
    
    # Additional context
    metadata = JSONField(default=dict)
    
    timestamp = DateTimeField(auto_now_add=True)
```

#### `TriageAssessment` Model
```python
class TriageAssessment(Model):
    incident = OneToOneField(Incident, related_name='triage')
    assessed_by = ForeignKey(User)
    
    # Triage classification
    triage_color = CharField(choices=[
        ('red', 'Red (Critical - Immediate)'),
        ('yellow', 'Yellow (Urgent - 15-60 mins)'),
        ('green', 'Green (Less Urgent - 1-2 hours)'),
        ('black', 'Black (Deceased)')
    ])
    
    priority_score = PositiveIntegerField(help_text="1-10 scale")
    
    # Assessment criteria
    airway_clear = BooleanField()
    breathing_adequate = BooleanField()
    circulation_adequate = BooleanField()
    
    consciousness_level = CharField(choices=[
        ('alert', 'Alert and Responsive'),
        ('voice', 'Responds to Voice'),
        ('pain', 'Responds to Pain'),
        ('unresponsive', 'Unresponsive')
    ])
    
    # Vital signs
    heart_rate = PositiveIntegerField(null=True, blank=True)
    blood_pressure = CharField(max_length=20, blank=True)
    temperature = DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    # Assessment notes
    assessment_notes = TextField()
    recommended_care_level = CharField(choices=[
        ('basic', 'Basic Life Support'),
        ('advanced', 'Advanced Life Support'),
        ('hospital', 'Hospital Care Required'),
        ('trauma_center', 'Trauma Center Required')
    ])
    
    assessed_at = DateTimeField(auto_now_add=True)
```

### Services

#### `EmergencyDispatchService`
```python
class EmergencyDispatchService:
    @staticmethod
    def create_sos_incident(reporter, incident_data, auto_dispatch=True):
        """Create SOS emergency with automatic triage and dispatch"""
        # 1. Validate GPS coordinates
        # 2. Create incident with unique number
        # 3. Create initial timeline entry
        # 4. Perform automatic triage assessment
        # 5. Trigger responder assignment if auto_dispatch enabled
        # 6. Send notifications to emergency contacts
        # 7. Log security event
        
    @staticmethod
    def update_incident_status(incident_id, new_status, updated_by, notes=""):
        """Update incident status and create timeline entry"""
        # 1. Validate status transition
        # 2. Update incident status
        # 3. Create timeline entry
        # 4. Send real-time updates via WebSocket
        # 5. Notify relevant stakeholders
```

#### `EmergencyTriageService`
```python
class EmergencyTriageService:
    @staticmethod
    def auto_triage_incident(incident, incident_data):
        """Automatically assess incident priority based on symptoms and type"""
        # 1. Analyze incident type and symptoms
        # 2. Check vital signs if available
        # 3. Calculate priority score using algorithm
        # 4. Assign triage color (red/yellow/green)
        # 5. Determine recommended care level
        # 6. Create triage assessment record
```

---

## 4. Responders App (`responders/`)

**Purpose:** Medical responder registration, verification, and dispatch management.

### Core Models

#### `Responder` Model
```python
class Responder(Model):
    id = UUIDField(primary_key=True)
    user = OneToOneField(User)
    
    # Professional information
    responder_type = CharField(choices=[
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('paramedic', 'Paramedic'),
        ('clinical_officer', 'Clinical Officer'),
        ('medical_assistant', 'Medical Assistant')
    ])
    
    full_name = CharField(max_length=255)
    license_number = CharField(max_length=50, unique=True)
    license_expiry_date = DateField()
    medical_council_number = CharField(max_length=50)
    
    # Qualifications
    primary_qualification = CharField(max_length=100)
    years_of_experience = PositiveIntegerField()
    specializations = TextField(help_text="Comma-separated specializations")
    
    # Hospital affiliations
    affiliated_hospitals = ManyToManyField('hospitals.Facility', blank=True)
    primary_hospital = ForeignKey('hospitals.Facility', null=True, blank=True)
    
    # Verification status
    verification_status = CharField(choices=[
        ('pending', 'Pending Verification'),
        ('documents_submitted', 'Documents Under Review'),
        ('verified', 'Verified'),
        ('rejected', 'Verification Rejected'),
        ('expired', 'License Expired')
    ])
    
    verification_notes = TextField(blank=True)
    verified_by = ForeignKey(User, null=True, blank=True, related_name='verified_responders')
    verified_at = DateTimeField(null=True, blank=True)
    
    # Current availability
    availability_status = CharField(choices=[
        ('available', 'Available'),
        ('busy', 'Busy with Patient'),
        ('off_duty', 'Off Duty'),
        ('unavailable', 'Unavailable')
    ])
    
    # Performance metrics
    total_responses = PositiveIntegerField(default=0)
    successful_responses = PositiveIntegerField(default=0)
    average_response_time_minutes = PositiveIntegerField(default=0)
    average_rating = DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Contact preferences
    preferred_contact_method = CharField(choices=[
        ('sms', 'SMS'),
        ('voice', 'Voice Call'),
        ('push', 'Push Notification')
    ], default='push')
    
    # Account status
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### `ResponderAvailability` Model
```python
class ResponderAvailability(Model):
    responder = ForeignKey(Responder)
    
    # Schedule information
    day_of_week = IntegerField(choices=[
        (1, 'Monday'), (2, 'Tuesday'), (3, 'Wednesday'),
        (4, 'Thursday'), (5, 'Friday'), (6, 'Saturday'), (7, 'Sunday')
    ])
    start_time = TimeField()
    end_time = TimeField()
    is_active = BooleanField(default=True)
    
    # Current location and service area
    current_location = PointField(null=True, blank=True)
    service_radius_km = PositiveIntegerField(default=10)
    location_updated_at = DateTimeField(null=True, blank=True)
    
    # Service preferences
    preferred_regions = TextField(blank=True, help_text="Preferred regions to serve")
    max_concurrent_cases = PositiveIntegerField(default=1)
    accepts_critical_cases = BooleanField(default=True)
    
    # Emergency availability override
    emergency_override = BooleanField(default=False)
    override_until = DateTimeField(null=True, blank=True)
```

### Key Features
- **Professional Verification**: Tanzania Medical Council license validation
- **Real-time Availability**: GPS location and schedule management
- **Specialization Matching**: Match responders to specific emergency types
- **Performance Tracking**: Response times, ratings, success rates

---

## 5. Assignments App (`assignments/`)

**Purpose:** Task coordination between incidents, responders, and ambulances.

### Core Models

#### `ResponderAssignment` Model
```python
class ResponderAssignment(Model):
    id = UUIDField(primary_key=True)
    incident = ForeignKey(Incident, related_name='assignments')
    responder = ForeignKey(Responder, related_name='assignments')
    
    status = CharField(choices=[
        ('pending', 'Assignment Pending'),
        ('sent', 'Notification Sent'),
        ('accepted', 'Accepted by Responder'),
        ('declined', 'Declined by Responder'),
        ('en_route', 'Responder En Route'),
        ('on_scene', 'Responder On Scene'),
        ('treatment_active', 'Treatment in Progress'),
        ('patient_stable', 'Patient Stabilized'),
        ('transport_needed', 'Transport Required'),
        ('transporting', 'Transporting Patient'),
        ('handover_complete', 'Handed Over to Hospital'),
        ('completed', 'Assignment Completed'),
        ('cancelled', 'Assignment Cancelled'),
        ('timeout', 'Assignment Timeout'),
        ('reassigned', 'Reassigned to Another Responder')
    ])
    
    priority = IntegerField(choices=[
        (1, 'Low Priority'),
        (2, 'Medium Priority'),
        (3, 'High Priority'),
        (4, 'Urgent Priority'),
        (5, 'Critical Priority')
    ], default=2)
    
    assignment_order = PositiveIntegerField(default=1, help_text="1=first choice, 2=second choice, etc.")
    
    # Location and distance calculation
    assigned_location = PointField(help_text="Responder's location when assigned")
    incident_location = PointField(help_text="Emergency location at time of assignment")
    estimated_distance_km = FloatField()
    estimated_travel_time_minutes = PositiveIntegerField()
    
    # Timeline tracking
    notification_sent_at = DateTimeField(null=True, blank=True)
    response_deadline = DateTimeField()
    responded_at = DateTimeField(null=True, blank=True)
    departed_at = DateTimeField(null=True, blank=True)
    arrived_at = DateTimeField(null=True, blank=True)
    treatment_started_at = DateTimeField(null=True, blank=True)
    patient_stabilized_at = DateTimeField(null=True, blank=True)
    transport_started_at = DateTimeField(null=True, blank=True)
    handover_completed_at = DateTimeField(null=True, blank=True)
    completed_at = DateTimeField(null=True, blank=True)
    
    # Performance metrics
    actual_travel_time_minutes = PositiveIntegerField(null=True, blank=True)
    total_response_time_minutes = PositiveIntegerField(null=True, blank=True)
    treatment_duration_minutes = PositiveIntegerField(null=True, blank=True)
    
    # Communication
    assignment_notes = TextField(blank=True)
    responder_notes = TextField(blank=True)
    decline_reason = CharField(max_length=100, blank=True)
    
    # Assignment metadata
    assignment_method = CharField(choices=[
        ('auto', 'Automatic Assignment'),
        ('manual', 'Manual Assignment'),
        ('self_assigned', 'Self-Assigned'),
        ('escalated', 'Escalated Assignment')
    ], default='auto')
    
    assigned_by = ForeignKey(User, null=True, blank=True, related_name='created_assignments')
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### Services

#### `AssignmentService`
```python
class AssignmentService:
    def auto_dispatch_emergency(self, incident):
        """Automatically assign responders and ambulance for emergency"""
        # 1. Find available responders within radius (expanding search)
        # 2. Filter by specialization match
        # 3. Calculate distances and travel times
        # 4. Assign up to 3 responders with priority order
        # 5. Dispatch ambulance if critical/high severity
        # 6. Send notifications via preferred channels
        # 7. Set response deadlines
        # 8. Create assignment metrics
        
    def assign_nearest_responders(self, incident, max_responders=3):
        """Find and assign nearest available responders"""
        # 1. Start with 5km radius, expand to 50km
        # 2. Query available responders with spatial search
        # 3. Filter by specialization requirements
        # 4. Sort by distance and estimated response time
        # 5. Create assignments with deadlines
        # 6. Return list of created assignments
```

---

## 6. Communications App (`communications/`)

**Purpose:** Multi-channel messaging using Twilio services.

### Core Models

#### `Message` Model
```python
class Message(Model):
    id = UUIDField(primary_key=True)
    sender = ForeignKey(User, null=True, blank=True, related_name='sent_messages')
    recipient = ForeignKey(User, related_name='received_messages')
    
    message_type = CharField(choices=[
        ('notification', 'Notification'),
        ('alert', 'Emergency Alert'),
        ('status_update', 'Status Update'),
        ('chat', 'Chat Message'),
        ('system', 'System Message')
    ], default='notification')
    
    channel = CharField(choices=[
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
        ('websocket', 'WebSocket'),
        ('voice', 'Voice Call'),
        ('email', 'Email'),
        ('in_app', 'In-App')
    ])
    
    title = CharField(max_length=200, blank=True)
    content = TextField()
    language = CharField(choices=[('en', 'English'), ('sw', 'Swahili')], default='en')
    
    # Delivery tracking
    status = CharField(choices=[
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
        ('expired', 'Expired')
    ], default='pending')
    
    sent_at = DateTimeField(null=True, blank=True)
    delivered_at = DateTimeField(null=True, blank=True)
    read_at = DateTimeField(null=True, blank=True)
    
    # Metadata and context
    metadata = JSONField(default=dict)
    external_id = CharField(max_length=100, blank=True)
    
    # Retry logic
    retry_count = PositiveIntegerField(default=0)
    max_retries = PositiveIntegerField(default=3)
    expires_at = DateTimeField(null=True, blank=True)
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### `TwilioSMSLog` Model
```python
class TwilioSMSLog(Model):
    id = UUIDField(primary_key=True)
    phone_number = PhoneNumberField()
    message_content = TextField()
    
    # Template information
    template_key = CharField(max_length=50, blank=True)
    language = CharField(choices=[('en', 'English'), ('sw', 'Swahili')], default='en')
    priority = CharField(choices=[
        ('normal', 'Normal'),
        ('urgent', 'Urgent'),
        ('critical', 'Critical')
    ], default='normal')
    
    # Twilio tracking
    message_sid = CharField(max_length=100, unique=True)
    status = CharField(choices=[
        ('queued', 'Queued'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('undelivered', 'Undelivered')
    ], default='queued')
    
    # Cost and delivery tracking
    cost = DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    error_code = CharField(max_length=10, blank=True)
    error_message = TextField(blank=True)
    
    # Timestamps
    sent_at = DateTimeField(auto_now_add=True)
    delivered_at = DateTimeField(null=True, blank=True)
    
    # Related objects
    incident = ForeignKey(Incident, null=True, blank=True)
    user = ForeignKey(User, null=True, blank=True)
```

### Twilio Integration Services

#### `TwilioSMSService`
```python
class TwilioSMSService:
    def __init__(self):
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    def send_emergency_sms(self, phone_number, template_key, context):
        """Send emergency SMS using template"""
        # 1. Get template in user's preferred language
        # 2. Render template with context variables
        # 3. Send via Twilio API
        # 4. Create SMS log record
        # 5. Handle any delivery failures
        
    def send_otp_sms(self, phone_number, otp_code, language='en'):
        """Send OTP verification SMS"""
        # 1. Get OTP template for language
        # 2. Format message with OTP code
        # 3. Send with high priority
        # 4. Log attempt and track delivery
        
    def handle_webhook_status(self, message_sid, status):
        """Handle Twilio delivery status webhook"""
        # 1. Find SMS log by message_sid
        # 2. Update delivery status
        # 3. Update timestamps
        # 4. Trigger any follow-up actions
```

---

## 7. Ambulances App (`ambulances/`)

**Purpose:** Ambulance fleet management and dispatch coordination.

### Core Models

#### `AmbulanceUnit` Model
```python
class AmbulanceUnit(Model):
    id = UUIDField(primary_key=True)
    unit_number = CharField(max_length=20, unique=True)
    
    # Facility association
    facility = ForeignKey('hospitals.Facility', related_name='ambulance_fleet')
    
    # Vehicle information
    make = CharField(max_length=50)
    model = CharField(max_length=50)
    year = PositiveIntegerField()
    license_plate = CharField(max_length=20, unique=True)
    chassis_number = CharField(max_length=50, unique=True, blank=True)
    
    # Equipment and capabilities
    equipment_level = CharField(choices=[
        ('basic', 'Basic Life Support (BLS)'),
        ('intermediate', 'Intermediate Life Support (ILS)'),
        ('advanced', 'Advanced Life Support (ALS)'),
        ('critical_care', 'Critical Care Transport (CCT)'),
        ('neonatal', 'Neonatal Intensive Care'),
        ('specialized', 'Specialized Transport')
    ], default='basic')
    
    patient_capacity = PositiveIntegerField(default=1)
    medical_equipment = JSONField(default=list)
    
    # Current status and location
    status = CharField(choices=[
        ('available', 'Available'),
        ('dispatched', 'Dispatched'),
        ('en_route', 'En Route to Scene'),
        ('on_scene', 'On Scene'),
        ('transporting', 'Transporting Patient'),
        ('at_hospital', 'At Hospital'),
        ('out_of_service', 'Out of Service'),
        ('maintenance', 'Under Maintenance')
    ], default='available')
    
    current_location = PointField(null=True, blank=True)
    last_location_update = DateTimeField(null=True, blank=True)
    
    # Maintenance and compliance
    last_inspection = DateField(null=True, blank=True)
    next_maintenance = DateField(null=True, blank=True)
    insurance_expiry = DateField(null=True, blank=True)
    is_operational = BooleanField(default=True)
    
    # Performance metrics
    total_dispatches = PositiveIntegerField(default=0)
    total_transports = PositiveIntegerField(default=0)
    average_response_time_minutes = PositiveIntegerField(default=0)
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### `AmbulanceDispatch` Model
```python
class AmbulanceDispatch(Model):
    id = UUIDField(primary_key=True)
    incident = ForeignKey(Incident, related_name='ambulance_dispatches')
    ambulance = ForeignKey(AmbulanceUnit, related_name='dispatches')
    
    status = CharField(choices=[
        ('pending', 'Pending Acceptance'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('en_route', 'En Route'),
        ('on_scene', 'On Scene'),
        ('transporting', 'Transporting'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], default='pending')
    
    priority = CharField(choices=[
        ('low', 'Low Priority'),
        ('normal', 'Normal Priority'),
        ('high', 'High Priority'),
        ('urgent', 'Urgent'),
        ('emergency', 'Emergency')
    ], default='normal')
    
    # Location and timing
    dispatch_location = PointField()
    estimated_arrival = DateTimeField(null=True, blank=True)
    actual_arrival = DateTimeField(null=True, blank=True)
    transport_started = DateTimeField(null=True, blank=True)
    hospital_arrival = DateTimeField(null=True, blank=True)
    
    # Instructions and notes
    dispatch_instructions = TextField(blank=True)
    crew_notes = TextField(blank=True)
    
    # Performance metrics
    response_time_minutes = PositiveIntegerField(null=True, blank=True)
    transport_time_minutes = PositiveIntegerField(null=True, blank=True)
    
    dispatched_at = DateTimeField(auto_now_add=True)
    completed_at = DateTimeField(null=True, blank=True)
    updated_at = DateTimeField(auto_now=True)
```

### Key Features
- **Real-time Fleet Tracking**: GPS location and status monitoring
- **Equipment-based Matching**: Assign ambulances based on medical equipment needs
- **Crew Management**: Track crew assignments and qualifications
- **Performance Analytics**: Response times, utilization rates, maintenance tracking

---

## 8. Geospatial App (`geospatial/`)

**Purpose:** Location services, mapping, and spatial analysis using PostGIS.

### Core Models

#### `Region` Model
```python
class Region(Model):
    name = CharField(max_length=100, unique=True)  # e.g., "Dar es Salaam"
    name_sw = CharField(max_length=100)  # Swahili name
    code = CharField(max_length=10, unique=True)  # e.g., "DSM"
    capital = CharField(max_length=100)
    
    # Geographic data (PostGIS)
    boundary = PolygonField(null=True, blank=True)
    center_point = PointField()
    
    # Administrative info
    population = PositiveIntegerField(null=True, blank=True)
    area_km2 = FloatField(null=True, blank=True)
    
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### `District` Model
```python
class District(Model):
    region = ForeignKey(Region, related_name='districts')
    name = CharField(max_length=100)
    name_sw = CharField(max_length=100)
    code = CharField(max_length=15, unique=True)
    
    # Geographic data
    boundary = PolygonField(null=True, blank=True)
    center_point = PointField()
    
    population = PositiveIntegerField(null=True, blank=True)
    area_km2 = FloatField(null=True, blank=True)
    is_active = BooleanField(default=True)
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### `ResponderServiceArea` Model
```python
class ResponderServiceArea(Model):
    responder = OneToOneField('responders.Responder', related_name='service_area')
    
    # Service coverage
    service_polygon = PolygonField()
    service_radius_km = FloatField(default=15.0)
    
    # Extended emergency coverage
    extended_polygon = PolygonField(null=True, blank=True)
    extended_radius_km = FloatField(null=True, blank=True)
    
    # Administrative coverage
    covered_regions = ManyToManyField(Region, blank=True)
    covered_districts = ManyToManyField(District, blank=True)
    
    # Base location and preferences
    home_base = PointField()
    current_location = PointField(null=True, blank=True)
    max_response_distance = FloatField(default=25.0)
    
    # Service constraints
    serves_rural_areas = BooleanField(default=True)
    serves_urban_areas = BooleanField(default=True)
    requires_road_access = BooleanField(default=True)
    
    # Transport capabilities
    has_vehicle = BooleanField(default=True)
    vehicle_type = CharField(choices=[
        ('car', 'Car'),
        ('suv', 'SUV/4WD'),
        ('motorcycle', 'Motorcycle'),
        ('bicycle', 'Bicycle'),
        ('boat', 'Boat'),
        ('helicopter', 'Helicopter'),
        ('walking', 'Walking Only')
    ], default='car')
    
    response_time_target = PositiveIntegerField(default=15)
    last_location_update = DateTimeField(null=True, blank=True)
    is_active = BooleanField(default=True)
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### Key Features
- **PostGIS Integration**: Advanced spatial queries and geographic analysis
- **Tanzania Administrative Boundaries**: All 31 regions and 184 districts
- **Service Area Management**: Define and manage responder coverage areas
- **Route Optimization**: Pre-calculated emergency routes between facilities
- **Geofencing**: Automatic triggers based on location

### Services

#### `LocationService`
```python
class LocationService:
    @staticmethod
    def find_nearest_responders(location, radius_km=15, limit=10):
        """Find nearest available responders using spatial query"""
        # PostGIS query to find responders within radius
        # Order by distance and availability
        # Consider service area constraints
        
    @staticmethod
    def calculate_route_distance(start_point, end_point):
        """Calculate distance and estimated time between two points"""
        # Use PostGIS distance calculation
        # Consider traffic conditions
        # Return distance in km and estimated time in minutes
```

This comprehensive documentation covers all 8 domain applications with their models, services, and key features, providing developers with complete understanding of the AfyaPapo emergency response system architecture.