from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from backend.app.models.models import User, UserPreference
from backend.app.schemas.schemas import UserCreate, UserResponse, Token, UserPreferenceUpdate, UserPreferenceResponse

router = APIRouter(prefix="/auth", tags=["Authentication & User"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # First registered user can be admin for local convenience
    user_count = db.query(User).count()
    is_admin = (user_count == 0)

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_admin=is_admin,
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create default user preference
    pref = UserPreference(
        user_id=user.id,
        preferred_categories=[],
        preferred_brands=[],
        important_features=[],
        quality_weight=0.50,
        affordability_weight=0.30,
        reliability_weight=0.20
    )
    db.add(pref)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return Token(access_token=token, user=UserResponse.model_validate(user))

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    token = create_access_token(subject=user.id)
    return Token(access_token=token, user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.get("/preferences", response_model=UserPreferenceResponse)
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return UserPreferenceResponse.model_validate(pref)

@router.put("/preferences", response_model=UserPreferenceResponse)
def update_preferences(
    pref_in: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if pref_in.preferred_categories is not None:
        pref.preferred_categories = pref_in.preferred_categories
    if pref_in.spending_budget is not None:
        pref.spending_budget = pref_in.spending_budget
    if pref_in.preferred_brands is not None:
        pref.preferred_brands = pref_in.preferred_brands
    if pref_in.important_features is not None:
        pref.important_features = pref_in.important_features
    if pref_in.quality_weight is not None:
        pref.quality_weight = pref_in.quality_weight
    if pref_in.affordability_weight is not None:
        pref.affordability_weight = pref_in.affordability_weight
    if pref_in.reliability_weight is not None:
        pref.reliability_weight = pref_in.reliability_weight

    db.commit()
    db.refresh(pref)
    return UserPreferenceResponse.model_validate(pref)
