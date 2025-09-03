# AfyaPapo Authentication & Security Guide

## Table of Contents

1. [Security Overview](#security-overview)
2. [JWT Authentication System](#jwt-authentication-system)
3. [Phone-based Verification](#phone-based-verification)
4. [Role-based Access Control](#role-based-access-control)
5. [API Security](#api-security)
6. [Data Protection](#data-protection)
7. [Security Monitoring](#security-monitoring)
8. [Implementation Examples](#implementation-examples)

## Security Overview

AfyaPapo implements a comprehensive security framework designed for Tanzania's healthcare emergency response system, ensuring protection of sensitive medical data and reliable authentication for critical healthcare scenarios.

### Security Principles
- **Defense in Depth**: Multiple layers of security controls
- **Zero Trust**: No implicit trust, verify everything
- **Healthcare Compliance**: GDPR and healthcare data protection standards
- **Tanzania Context**: Optimized for mobile-first, phone-based authentication

### Key Security Features
- **JWT-based Authentication** with multiple token types
- **Phone OTP Verification** via Twilio SMS
- **Role-based Access Control** with granular permissions
- **End-to-end Encryption** for sensitive medical data
- **Comprehensive Audit Logging** for healthcare compliance
- **Rate Limiting** and DDoS protection
- **Real-time Security Monitoring**

## JWT Authentication System

### Token Architecture

```python
# afyaPapo_core/auth.py
class JWTManager:
    """
    JWT Token management with industry security standards
    """
    
    # Token types and lifespans
    ACCESS_TOKEN = 'access'           # 15 minutes
    REFRESH_TOKEN = 'refresh'         # 7 days
    VERIFICATION_TOKEN = 'verification' # 24 hours
    
    # Security algorithms
    ALGORITHM = 'HS256'
    SECRET_KEY = settings.SECRET_KEY  # 256-bit minimum
    
    @classmethod
    def generate_access_token(cls, user) -> str:
        """Generate short-lived access token for API authentication"""
        now = timezone.now()
        payload = {
            'user_id': str(user.id),
            'username': user.username,
            'phone_number': str(user.phone_number) if user.phone_number else None,
            'user_type': user.user_type,
            'verification_status': user.verification_status,
            'is_phone_verified': user.is_phone_verified,
            'token_type': cls.ACCESS_TOKEN,
            'iat': int(now.timestamp()),
            'exp': int((now + cls.ACCESS_TOKEN_LIFETIME).timestamp()),
            'nbf': int(now.timestamp()),
            'iss': 'afyapapo-api',
            'aud': 'afyapapo-client',
            'jti': str(uuid.uuid4())  # JWT ID for blacklisting
        }
        
        return jwt.encode(payload, cls._get_secret_key(), algorithm=cls.ALGORITHM)
    
    @classmethod
    def validate_token(cls, token: str) -> Tuple[bool, Dict, str]:
        """Validate JWT token and return payload"""
        try:
            payload = jwt.decode(
                token, 
                cls._get_secret_key(), 
                algorithms=[cls.ALGORITHM],
                audience='afyapapo-client',
                issuer='afyapapo-api'
            )
            
            # Check if token is blacklisted
            if cls._is_token_blacklisted(payload.get('jti')):
                return False, {}, 'Token has been revoked'
            
            # Validate token type
            if payload.get('token_type') != cls.ACCESS_TOKEN:
                return False, {}, 'Invalid token type'
            
            return True, payload, ''
            
        except jwt.ExpiredSignatureError:
            return False, {}, 'Token has expired'
        except jwt.InvalidTokenError as e:
            return False, {}, f'Invalid token: {str(e)}'
    
    @classmethod
    def generate_refresh_token(cls, user) -> str:
        """Generate long-lived refresh token"""
        now = timezone.now()
        payload = {
            'user_id': str(user.id),
            'token_type': cls.REFRESH_TOKEN,
            'iat': int(now.timestamp()),
            'exp': int((now + cls.REFRESH_TOKEN_LIFETIME).timestamp()),
            'jti': str(uuid.uuid4())
        }
        
        return jwt.encode(payload, cls._get_secret_key(), algorithm=cls.ALGORITHM)
    
    @classmethod
    def blacklist_token(cls, jti: str):
        """Add token to blacklist"""
        # Store in Redis with expiration
        cache.set(f'blacklisted_token:{jti}', True, timeout=86400 * 7)  # 7 days
```

### Authentication Middleware

```python
# afyaPapo_core/middleware.py
class JWTAuthenticationMiddleware:
    """
    JWT Authentication middleware for GraphQL requests
    """
    
    def __init__(self):
        self.jwt_manager = JWTManager()
    
    def resolve(self, next, root, info, **args):
        request = info.context
        
        # Skip authentication for public resolvers
        if self._is_public_resolver(info):
            return next(root, info, **args)
        
        # Extract token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise GraphQLError('Authentication required')
        
        token = auth_header.split(' ')[1]
        
        # Validate token
        is_valid, payload, error_msg = self.jwt_manager.validate_token(token)
        if not is_valid:
            raise GraphQLError(f'Authentication failed: {error_msg}')
        
        # Get user from database
        try:
            user = User.objects.get(id=payload['user_id'])
            if not user.is_active:
                raise GraphQLError('User account is disabled')
        except User.DoesNotExist:
            raise GraphQLError('User not found')
        
        # Add user to request context
        request.user = user
        request.jwt_payload = payload
        
        # Log security event
        SecurityLog.objects.create(
            user=user,
            event_type='api_access',
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            metadata={'endpoint': info.field_name}
        )
        
        return next(root, info, **args)
    
    def _is_public_resolver(self, info):
        """Check if resolver is public (doesn't require authentication)"""
        public_resolvers = [
            'register', 'login', 'verifyPhone', 'requestOTP',
            'refreshToken', 'publicHospitalList'
        ]
        return info.field_name in public_resolvers
```

## Phone-based Verification

### OTP Generation and Verification

```python
# users/services.py
import secrets
import hashlib
from django.core.cache import cache
from twilio.rest import Client

class PhoneVerificationService:
    """
    Secure phone number verification using OTP via Twilio SMS
    """
    
    def __init__(self):
        self.twilio_client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )
        self.from_number = settings.TWILIO_PHONE_NUMBER
    
    def generate_otp(self, phone_number: str, verification_type: str) -> Dict:
        """Generate and send OTP code"""
        
        # Rate limiting - max 3 OTPs per phone per hour
        rate_limit_key = f"otp_rate_limit:{phone_number}"
        current_count = cache.get(rate_limit_key, 0)
        if current_count >= 3:
            raise ValidationError("Too many OTP requests. Please wait before requesting again.")
        
        # Generate 6-digit OTP
        otp_code = f"{secrets.randbelow(900000) + 100000:06d}"
        
        # Create secure hash of OTP for storage
        otp_hash = hashlib.sha256(f"{otp_code}{settings.SECRET_KEY}".encode()).hexdigest()
        
        # Store verification record
        verification = PhoneVerification.objects.create(
            phone_number=phone_number,
            otp_code='',  # Never store plain OTP
            otp_hash=otp_hash,
            verification_type=verification_type,
            expires_at=timezone.now() + timedelta(minutes=10),  # 10 minute expiry
            attempts=0,
            max_attempts=3
        )
        
        # Send OTP via Twilio SMS
        try:
            message_template = self._get_otp_template(verification_type)
            message_body = message_template.format(otp_code=otp_code)
            
            message = self.twilio_client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=phone_number
            )
            
            # Log SMS attempt
            TwilioSMSLog.objects.create(
                phone_number=phone_number,
                message_content=message_body,
                message_sid=message.sid,
                template_key=f'otp_{verification_type}',
                priority='urgent'
            )
            
            # Increment rate limiting counter
            cache.set(rate_limit_key, current_count + 1, timeout=3600)  # 1 hour
            
            return {
                'success': True,
                'verification_id': verification.id,
                'expires_at': verification.expires_at,
                'message': 'OTP sent successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to send OTP to {phone_number}: {str(e)}")
            verification.delete()  # Clean up failed verification
            raise ValidationError("Failed to send OTP. Please try again.")
    
    def verify_otp(self, phone_number: str, otp_code: str, verification_type: str) -> Dict:
        """Verify OTP code"""
        
        try:
            verification = PhoneVerification.objects.get(
                phone_number=phone_number,
                verification_type=verification_type,
                is_verified=False,
                expires_at__gt=timezone.now()
            )
        except PhoneVerification.DoesNotExist:
            raise ValidationError("Invalid or expired verification code")
        
        # Check attempt limits
        if verification.attempts >= verification.max_attempts:
            raise ValidationError("Maximum verification attempts exceeded")
        
        # Verify OTP hash
        provided_hash = hashlib.sha256(f"{otp_code}{settings.SECRET_KEY}".encode()).hexdigest()
        
        if not secrets.compare_digest(verification.otp_hash, provided_hash):
            verification.attempts += 1
            verification.save()
            
            remaining_attempts = verification.max_attempts - verification.attempts
            if remaining_attempts > 0:
                raise ValidationError(f"Invalid code. {remaining_attempts} attempts remaining.")
            else:
                raise ValidationError("Invalid code. Maximum attempts exceeded.")
        
        # Mark verification as successful
        verification.is_verified = True
        verification.verified_at = timezone.now()
        verification.save()
        
        # Update user verification status if this is registration
        if verification_type == 'registration':
            try:
                user = User.objects.get(phone_number=phone_number)
                user.is_phone_verified = True
                user.verification_status = 'phone_verified'
                user.save()
                
                # Generate authentication tokens
                access_token = JWTManager.generate_access_token(user)
                refresh_token = JWTManager.generate_refresh_token(user)
                
                return {
                    'success': True,
                    'user': user,
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'message': 'Phone number verified successfully'
                }
            except User.DoesNotExist:
                raise ValidationError("User not found")
        
        return {
            'success': True,
            'message': 'Verification successful'
        }
    
    def _get_otp_template(self, verification_type: str) -> str:
        """Get SMS template for OTP based on type"""
        templates = {
            'registration': 'AfyaPapo: Your registration code is {otp_code}. Valid for 10 minutes. Do not share this code.',
            'login': 'AfyaPapo: Your login code is {otp_code}. Valid for 10 minutes.',
            'password_reset': 'AfyaPapo: Your password reset code is {otp_code}. Valid for 10 minutes.'
        }
        return templates.get(verification_type, templates['registration'])
```

## Role-based Access Control

### Permission System

```python
# users/permissions.py
class PermissionManager:
    """
    Role-based access control system for AfyaPapo
    """
    
    # Define permissions for each user type
    PERMISSIONS = {
        'citizen': {
            'incidents': ['create_own', 'view_own', 'update_own'],
            'profile': ['view_own', 'update_own'],
            'emergency_contacts': ['manage_own'],
            'notifications': ['view_own']
        },
        
        'responder': {
            'incidents': ['view_assigned', 'update_assigned'],
            'assignments': ['accept', 'decline', 'update_status'],
            'profile': ['view_own', 'update_own'],
            'location': ['update_own'],
            'patients': ['view_assigned', 'handover'],
            'communications': ['send_to_assigned']
        },
        
        'hospital_admin': {
            'facility': ['view', 'manage_beds', 'manage_resources', 'view_analytics'],
            'ambulances': ['view', 'dispatch', 'manage_fleet'],
            'incidents': ['view_facility_related'],
            'staff': ['view', 'manage_schedules'],
            'inventory': ['view', 'update', 'order'],
            'analytics': ['view_facility', 'export_reports']
        },
        
        'system_admin': {
            'all': ['full_access']
        },
        
        'dispatcher': {
            'incidents': ['view_all', 'assign_responders', 'coordinate'],
            'responders': ['view_all', 'assign', 'communicate'],
            'ambulances': ['view_all', 'dispatch', 'coordinate'],
            'facilities': ['view_all', 'coordinate'],
            'analytics': ['view_operational']
        }
    }
    
    @classmethod
    def has_permission(cls, user, resource: str, action: str) -> bool:
        """Check if user has permission for specific resource and action"""
        
        if not user or not user.is_active:
            return False
        
        user_permissions = cls.PERMISSIONS.get(user.user_type, {})
        
        # System admin has full access
        if user_permissions.get('all') and 'full_access' in user_permissions['all']:
            return True
        
        # Check specific permission
        resource_permissions = user_permissions.get(resource, [])
        return action in resource_permissions
    
    @classmethod
    def get_user_permissions(cls, user) -> Dict:
        """Get all permissions for a user"""
        if not user or not user.is_active:
            return {}
        
        return cls.PERMISSIONS.get(user.user_type, {})
    
    @classmethod
    def require_permission(cls, resource: str, action: str):
        """Decorator to require specific permission"""
        def decorator(func):
            def wrapper(self, info, **kwargs):
                user = info.context.user
                
                if not cls.has_permission(user, resource, action):
                    raise GraphQLError(
                        f"Permission denied: {action} on {resource} requires {user.user_type} role"
                    )
                
                return func(self, info, **kwargs)
            return wrapper
        return decorator

# Usage in GraphQL resolvers
class IncidentMutations:
    @PermissionManager.require_permission('incidents', 'create_own')
    def create_incident(self, info, input):
        # Only citizens can create their own incidents
        pass
    
    @PermissionManager.require_permission('incidents', 'view_all')
    def list_all_incidents(self, info):
        # Only dispatchers and system admins can view all incidents
        pass
```

### GraphQL Permission Integration

```python
# afyaPapo_core/schema.py
class SecureResolver:
    """Base resolver with permission checking"""
    
    def __init__(self, required_permission=None, resource_check=None):
        self.required_permission = required_permission
        self.resource_check = resource_check
    
    def __call__(self, func):
        def wrapper(root, info, **kwargs):
            user = info.context.user
            
            # Check basic authentication
            if not user or not user.is_authenticated:
                raise GraphQLError('Authentication required')
            
            # Check specific permission if required
            if self.required_permission:
                resource, action = self.required_permission
                if not PermissionManager.has_permission(user, resource, action):
                    raise GraphQLError(f'Permission denied: {action} on {resource}')
            
            # Check resource-specific permissions
            if self.resource_check:
                if not self.resource_check(user, kwargs):
                    raise GraphQLError('Access denied to this resource')
            
            return func(root, info, **kwargs)
        
        return wrapper

# Example usage
@strawberry.type
class IncidentMutations:
    @strawberry.mutation
    @SecureResolver(required_permission=('incidents', 'create_own'))
    def create_incident(self, input: CreateIncidentInput) -> IncidentType:
        # Implementation
        pass
    
    @strawberry.mutation
    @SecureResolver(
        required_permission=('assignments', 'accept'),
        resource_check=lambda user, kwargs: is_assignment_for_user(user, kwargs.get('assignment_id'))
    )
    def accept_assignment(self, assignment_id: str) -> ResponderAssignmentType:
        # Implementation
        pass
```

## API Security

### Rate Limiting

```python
# afyaPapo_core/middleware.py
class RateLimitingMiddleware:
    """
    Comprehensive rate limiting for API protection
    """
    
    def __init__(self):
        self.limits = {
            # Per IP limits
            'default': {'requests': 100, 'window': 300},      # 100 req/5min
            'auth': {'requests': 10, 'window': 300},          # 10 auth attempts/5min
            'emergency': {'requests': 5, 'window': 60},       # 5 emergency calls/min
            
            # Per user limits (authenticated)
            'citizen': {'requests': 200, 'window': 300},      # 200 req/5min
            'responder': {'requests': 500, 'window': 300},    # 500 req/5min
            'hospital_admin': {'requests': 1000, 'window': 300}, # 1000 req/5min
        }
    
    def process_request(self, request):
        client_ip = self._get_client_ip(request)
        user = getattr(request, 'user', None)
        endpoint = self._get_endpoint(request)
        
        # Determine rate limit key and limits
        if user and user.is_authenticated:
            limit_key = f"rate_limit:user:{user.id}"
            limits = self.limits.get(user.user_type, self.limits['default'])
        else:
            limit_key = f"rate_limit:ip:{client_ip}"
            limits = self.limits['default']
        
        # Apply special limits for sensitive endpoints
        if endpoint in ['login', 'register', 'verifyPhone']:
            limits = self.limits['auth']
        elif endpoint in ['createIncident']:
            limits = self.limits['emergency']
        
        # Check rate limit
        current_requests = cache.get(limit_key, 0)
        
        if current_requests >= limits['requests']:
            # Log rate limit violation
            SecurityLog.objects.create(
                event_type='rate_limit_exceeded',
                ip_address=client_ip,
                user=user,
                metadata={
                    'endpoint': endpoint,
                    'requests': current_requests,
                    'limit': limits['requests']
                }
            )
            
            return HttpResponse('Rate limit exceeded', status=429)
        
        # Increment request count
        cache.set(limit_key, current_requests + 1, timeout=limits['window'])
        
        return None
    
    def _get_client_ip(self, request):
        """Extract client IP considering proxies"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
```

### Input Validation and Sanitization

```python
# utils/validation.py
class SecurityValidator:
    """
    Input validation and sanitization for security
    """
    
    @staticmethod
    def validate_phone_number(phone: str) -> bool:
        """Validate Tanzania phone number format"""
        import re
        # Tanzania phone pattern: +255XXXXXXXXX
        pattern = r'^\+255[67][0-9]{8}$'
        return bool(re.match(pattern, phone))
    
    @staticmethod
    def sanitize_text_input(text: str, max_length: int = 1000) -> str:
        """Sanitize text input to prevent XSS and injection"""
        import bleach
        
        if not text:
            return ''
        
        # Remove potentially dangerous characters
        cleaned = bleach.clean(
            text[:max_length],
            tags=[],  # No HTML tags allowed
            attributes={},
            protocols=[],
            strip=True
        )
        
        return cleaned.strip()
    
    @staticmethod
    def validate_location_coordinates(lat: float, lng: float) -> bool:
        """Validate GPS coordinates are within Tanzania bounds"""
        # Tanzania bounds (approximate)
        tanzania_bounds = {
            'min_lat': -11.745398,
            'max_lat': -0.990736,
            'min_lng': 29.340000,
            'max_lng': 40.316667
        }
        
        return (
            tanzania_bounds['min_lat'] <= lat <= tanzania_bounds['max_lat'] and
            tanzania_bounds['min_lng'] <= lng <= tanzania_bounds['max_lng']
        )
    
    @staticmethod
    def validate_medical_data(data: Dict) -> Dict:
        """Validate and sanitize medical data input"""
        validated = {}
        
        # Sanitize text fields
        for field in ['symptoms', 'medical_conditions', 'medications', 'allergies']:
            if field in data:
                validated[field] = SecurityValidator.sanitize_text_input(
                    data[field], max_length=2000
                )
        
        # Validate numeric fields
        if 'patient_age' in data:
            age = data['patient_age']
            if isinstance(age, int) and 0 <= age <= 150:
                validated['patient_age'] = age
        
        return validated
```

## Data Protection

### Encryption Implementation

```python
# utils/encryption.py
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

class DataEncryption:
    """
    AES encryption for sensitive medical data
    """
    
    def __init__(self):
        self.key = self._generate_key()
        self.cipher = Fernet(self.key)
    
    def _generate_key(self):
        """Generate encryption key from Django secret"""
        password = settings.SECRET_KEY.encode()
        salt = settings.ENCRYPTION_SALT.encode() if hasattr(settings, 'ENCRYPTION_SALT') else b'afyapapo_salt'
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        return key
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        if not data:
            return data
        
        encrypted = self.cipher.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        if not encrypted_data:
            return encrypted_data
        
        try:
            decoded = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted = self.cipher.decrypt(decoded)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            return ''

# Model field encryption
class EncryptedTextField(models.TextField):
    """Custom field that automatically encrypts/decrypts data"""
    
    def __init__(self, *args, **kwargs):
        self.encryptor = DataEncryption()
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return self.encryptor.decrypt_data(value)
    
    def to_python(self, value):
        if isinstance(value, str) or value is None:
            return value
        return self.encryptor.decrypt_data(value)
    
    def get_prep_value(self, value):
        if value is None:
            return value
        return self.encryptor.encrypt_data(value)

# Usage in models
class UserProfile(models.Model):
    # Encrypted sensitive medical data
    medical_conditions = EncryptedTextField(blank=True)
    medications = EncryptedTextField(blank=True)
    allergies = EncryptedTextField(blank=True)
    
    # Encrypted identification
    national_id_number = EncryptedTextField()
    health_insurance_number = EncryptedTextField(blank=True)
```

## Security Monitoring

### Comprehensive Security Logging

```python
# users/models.py
class SecurityLog(models.Model):
    """
    Comprehensive security event logging for audit trails
    """
    
    class EventType(models.TextChoices):
        LOGIN_SUCCESS = 'login_success', 'Login Success'
        LOGIN_FAILURE = 'login_failure', 'Login Failure'
        LOGOUT = 'logout', 'Logout'
        PASSWORD_CHANGE = 'password_change', 'Password Change'
        PHONE_VERIFICATION = 'phone_verification', 'Phone Verification'
        API_ACCESS = 'api_access', 'API Access'
        PERMISSION_DENIED = 'permission_denied', 'Permission Denied'
        RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded', 'Rate Limit Exceeded'
        SUSPICIOUS_ACTIVITY = 'suspicious_activity', 'Suspicious Activity'
        EMERGENCY_ACCESS = 'emergency_access', 'Emergency Access'
        DATA_ACCESS = 'data_access', 'Sensitive Data Access'
        SECURITY_BREACH = 'security_breach', 'Security Breach'
    
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    event_type = models.CharField(max_length=50, choices=EventType.choices)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    
    # Event details
    description = models.TextField()
    metadata = models.JSONField(default=dict)
    
    # Security flags
    severity = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('critical', 'Critical')
        ],
        default='low'
    )
    requires_attention = models.BooleanField(default=False)
    
    # Location information
    location = models.PointField(null=True, blank=True)
    country = models.CharField(max_length=2, blank=True)
    region = models.CharField(max_length=100, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'event_type', 'timestamp']),
            models.Index(fields=['event_type', 'severity']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['ip_address']),
        ]
    
    @classmethod
    def log_security_event(cls, event_type: str, user=None, request=None, **kwargs):
        """Log a security event"""
        
        # Extract request information
        ip_address = cls._get_client_ip(request) if request else None
        user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
        
        # Determine severity
        severity = kwargs.get('severity', 'low')
        if event_type in ['security_breach', 'suspicious_activity']:
            severity = 'critical'
        elif event_type in ['permission_denied', 'rate_limit_exceeded']:
            severity = 'high'
        
        # Create log entry
        log_entry = cls.objects.create(
            user=user,
            event_type=event_type,
            ip_address=ip_address,
            user_agent=user_agent,
            description=kwargs.get('description', ''),
            metadata=kwargs.get('metadata', {}),
            severity=severity,
            requires_attention=severity in ['high', 'critical']
        )
        
        # Trigger alerts for critical events
        if severity == 'critical':
            cls._trigger_security_alert(log_entry)
        
        return log_entry
    
    @staticmethod
    def _get_client_ip(request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
    
    @staticmethod
    def _trigger_security_alert(log_entry):
        """Trigger security alert for critical events"""
        # Send alert to security team
        # This could be email, Slack, SMS, etc.
        pass

# Security monitoring service
class SecurityMonitor:
    """
    Real-time security monitoring and threat detection
    """
    
    @classmethod
    def detect_suspicious_activity(cls, user, request):
        """Detect suspicious activity patterns"""
        
        # Check for unusual login locations
        recent_logins = SecurityLog.objects.filter(
            user=user,
            event_type='login_success',
            timestamp__gte=timezone.now() - timedelta(days=7)
        ).values_list('ip_address', flat=True)
        
        current_ip = SecurityLog._get_client_ip(request)
        if recent_logins and current_ip not in recent_logins:
            cls._alert_unusual_location(user, current_ip, recent_logins)
        
        # Check for rapid successive login attempts
        recent_attempts = SecurityLog.objects.filter(
            user=user,
            event_type__in=['login_success', 'login_failure'],
            timestamp__gte=timezone.now() - timedelta(minutes=10)
        ).count()
        
        if recent_attempts > 5:
            cls._alert_rapid_login_attempts(user, recent_attempts)
    
    @staticmethod
    def _alert_unusual_location(user, current_ip, recent_ips):
        """Alert for login from unusual location"""
        SecurityLog.log_security_event(
            event_type='suspicious_activity',
            user=user,
            description=f'Login from unusual location: {current_ip}',
            metadata={'current_ip': current_ip, 'recent_ips': list(recent_ips)},
            severity='high'
        )
```

## Implementation Examples

### Complete Authentication Flow

```python
# GraphQL mutations for authentication
@strawberry.type
class AuthMutations:
    
    @strawberry.mutation
    def register(self, input: RegisterInput) -> AuthPayload:
        """User registration with phone verification"""
        try:
            # Validate input
            if not SecurityValidator.validate_phone_number(input.phone_number):
                return AuthPayload(
                    success=False,
                    errors=['Invalid phone number format for Tanzania']
                )
            
            # Check if user already exists
            if User.objects.filter(phone_number=input.phone_number).exists():
                return AuthPayload(
                    success=False,
                    errors=['Phone number already registered']
                )
            
            # Create user account
            user = User.objects.create_user(
                username=input.phone_number,  # Use phone as username
                phone_number=input.phone_number,
                user_type=input.user_type,
                preferred_language=input.preferred_language,
                is_phone_verified=False
            )
            
            # Create user profile
            UserProfile.objects.create(
                user=user,
                full_name=SecurityValidator.sanitize_text_input(input.full_name)
            )
            
            # Send OTP for phone verification
            verification_service = PhoneVerificationService()
            otp_result = verification_service.generate_otp(
                input.phone_number,
                'registration'
            )
            
            # Log registration event
            SecurityLog.log_security_event(
                event_type='registration',
                user=user,
                description=f'User registered: {input.phone_number}',
                metadata={'user_type': input.user_type}
            )
            
            return AuthPayload(
                success=True,
                user=user,
                message=f'Registration successful. OTP sent to {input.phone_number}'
            )
            
        except Exception as e:
            logger.error(f'Registration error: {str(e)}')
            return AuthPayload(
                success=False,
                errors=['Registration failed. Please try again.']
            )
    
    @strawberry.mutation
    def login(self, input: LoginInput, info: Info) -> AuthPayload:
        """User login with optional 2FA"""
        try:
            # Validate phone number
            if not SecurityValidator.validate_phone_number(input.phone_number):
                return AuthPayload(
                    success=False,
                    errors=['Invalid phone number format']
                )
            
            # Get user
            try:
                user = User.objects.get(phone_number=input.phone_number)
            except User.DoesNotExist:
                # Log failed login attempt
                SecurityLog.log_security_event(
                    event_type='login_failure',
                    request=info.context,
                    description=f'Login attempt with non-existent phone: {input.phone_number}',
                    severity='medium'
                )
                return AuthPayload(
                    success=False,
                    errors=['Invalid phone number or password']
                )
            
            # Check if account is locked
            if user.account_locked_until and user.account_locked_until > timezone.now():
                return AuthPayload(
                    success=False,
                    errors=['Account temporarily locked due to security reasons']
                )
            
            # Verify password
            if not user.check_password(input.password):
                # Increment failed login attempts
                user.login_attempts += 1
                if user.login_attempts >= 5:
                    # Lock account for 30 minutes
                    user.account_locked_until = timezone.now() + timedelta(minutes=30)
                user.save()
                
                # Log failed attempt
                SecurityLog.log_security_event(
                    event_type='login_failure',
                    user=user,
                    request=info.context,
                    description=f'Failed login attempt #{user.login_attempts}'
                )
                
                return AuthPayload(
                    success=False,
                    errors=['Invalid phone number or password']
                )
            
            # Reset login attempts on successful auth
            user.login_attempts = 0
            user.account_locked_until = None
            user.last_login = timezone.now()
            user.save()
            
            # Check for suspicious activity
            SecurityMonitor.detect_suspicious_activity(user, info.context)
            
            # Generate tokens
            access_token = JWTManager.generate_access_token(user)
            refresh_token = JWTManager.generate_refresh_token(user)
            
            # Log successful login
            SecurityLog.log_security_event(
                event_type='login_success',
                user=user,
                request=info.context,
                description='Successful login',
                metadata={'user_type': user.user_type}
            )
            
            return AuthPayload(
                success=True,
                access_token=access_token,
                refresh_token=refresh_token,
                user=user,
                message='Login successful'
            )
            
        except Exception as e:
            logger.error(f'Login error: {str(e)}')
            return AuthPayload(
                success=False,
                errors=['Login failed. Please try again.']
            )
```

### Security Headers and HTTPS Configuration

```python
# settings.py
# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_REDIRECT_EXEMPT = []
SECURE_REFERRER_POLICY = 'same-origin'
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Custom security headers middleware
class SecurityHeadersMiddleware:
    """Add additional security headers"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        response['X-Frame-Options'] = 'DENY'
        response['X-Content-Type-Options'] = 'nosniff'
        response['Referrer-Policy'] = 'same-origin'
        response['Permissions-Policy'] = 'geolocation=(self), microphone=(), camera=()'
        
        # CSP for GraphQL endpoint
        if '/graphql' in request.path:
            response['Content-Security-Policy'] = (
                "default-src 'none'; "
                "script-src 'self'; "
                "connect-src 'self'; "
                "img-src 'self'; "
                "style-src 'self' 'unsafe-inline'"
            )
        
        return response
```

This comprehensive authentication and security guide provides the foundation for implementing robust security measures in the AfyaPapo emergency response system, ensuring protection of sensitive healthcare data while maintaining usability for critical emergency scenarios.