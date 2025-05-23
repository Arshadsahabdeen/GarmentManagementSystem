from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import SessionLocal
from app.db.models.user import User
from datetime import time

# Define the OAuth2 scheme with the correct token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Decode and validate JWT token (assuming this is the implementation of decode_access_token)
def decode_access_token(token: str) -> Optional[dict]:
    try:
        # Replace "your_secret_key" with your actual JWT secret key
        # Replace "HS256" with your algorithm if different
        payload = jwt.decode(token, "your_secret_key", algorithms=["HS256"])
        return payload
    except JWTError as e:
        print(f"JWT decoding error: {str(e)}")
        return None

# Get the current user from the token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    # Define specific exceptions for different failure cases
    invalid_token_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_not_found_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User not found",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode the token
    payload = decode_access_token(token)
    if payload is None:
        raise invalid_token_exception

    # Extract the username (subject) from the token payload
    username: Optional[str] = payload.get("sub")
    if username is None:
        raise invalid_token_exception

    # Query the user from the database
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise user_not_found_exception

    # Optional: Check token expiration (if not already handled in decode_access_token)
    exp = payload.get("exp")
    if exp is None or exp < int(time.time()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

# Ensure the user is an admin
def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    # Check if the role field exists and is a string
    if not hasattr(current_user, 'role') or current_user.role is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User role not defined"
        )
    
    # Case-insensitive admin role check
    if current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires admin privileges"
        )
    return current_user