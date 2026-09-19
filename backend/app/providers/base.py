from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class BaseAIProvider(ABC):
    @abstractmethod
    def generate_response(self, prompt: str, system_instruction: Optional[str] = None, context: Optional[Dict[str, Any]] = None) -> str:
        pass

    @abstractmethod
    def plan_trip(self, user_preferences: Dict[str, Any], catalog_data: Dict[str, Any]) -> Dict[str, Any]:
        pass


class BaseWeatherProvider(ABC):
    @abstractmethod
    def get_weather(self, destination: str, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        pass


class BasePaymentProvider(ABC):
    @abstractmethod
    def create_order(self, amount: float, currency: str, receipt: str, notes: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def verify_payment(self, order_id: str, payment_id: str, signature: str) -> bool:
        pass


class BaseSMSProvider(ABC):
    @abstractmethod
    def send_otp(self, to_number: str, otp_code: str) -> bool:
        pass


class BaseTravelProvider(ABC):
    @abstractmethod
    def search_transport(self, origin: str, destination: str, date: str, excluded_modes: List[str]) -> List[Dict[str, Any]]:
        pass


class BaseMapsProvider(ABC):
    @abstractmethod
    def calculate_distance(self, origin: str, destination: str) -> Dict[str, Any]:
        pass


class BaseEmailProvider(ABC):
    @abstractmethod
    def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        pass

