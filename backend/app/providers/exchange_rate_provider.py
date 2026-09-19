import time
import urllib.request
import json
import logging
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional

logger = logging.getLogger("navora.currency")

# Fallback realistic exchange rates against USD (base = 1.0 USD)
SANDBOX_EXCHANGE_RATES: Dict[str, float] = {
    "USD": 1.0,
    "INR": 83.50,       # 1 USD ≈ 83.50 INR
    "EUR": 0.92,        # 1 USD ≈ 0.92 EUR
    "GBP": 0.78,        # 1 USD ≈ 0.78 GBP
    "JPY": 155.20,      # 1 USD ≈ 155.20 JPY
    "AUD": 1.52,        # 1 USD ≈ 1.52 AUD
    "CAD": 1.37,        # 1 USD ≈ 1.37 CAD
    "AED": 3.67,        # 1 USD ≈ 3.67 AED
    "SGD": 1.35,        # 1 USD ≈ 1.35 SGD
    "CHF": 0.90,        # 1 USD ≈ 0.90 CHF
    "THB": 36.80,       # 1 USD ≈ 36.80 THB
    "IDR": 16200.0,     # 1 USD ≈ 16,200 IDR
    "ZAR": 18.40,       # 1 USD ≈ 18.40 ZAR
    "PEN": 3.75,        # 1 USD ≈ 3.75 PEN
    "MVR": 15.45,       # 1 USD ≈ 15.45 MVR
}

CURRENCY_SYMBOLS: Dict[str, str] = {
    "USD": "$",
    "INR": "₹",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "AUD": "A$",
    "CAD": "C$",
    "AED": "د.إ",
    "SGD": "S$",
    "CHF": "CHF",
    "THB": "฿",
    "IDR": "Rp",
    "ZAR": "R",
    "PEN": "S/.",
    "MVR": "Rf",
}


class ExchangeRateProvider:
    def __init__(self):
        self._cache: Dict[str, float] = dict(SANDBOX_EXCHANGE_RATES)
        self._last_fetched: float = 0.0
        self._cache_ttl: float = 3600.0  # 1 hour TTL
        self._source: str = "NAVORA Sandbox Realistic Benchmark"
        self._is_live: bool = False

    def _fetch_live_rates(self) -> bool:
        """Attempts to fetch live exchange rates from public API without requiring external keys."""
        try:
            req = urllib.request.Request(
                "https://open.er-api.com/v6/latest/USD",
                headers={"User-Agent": "NAVORA-Travel-Engine/1.0"}
            )
            with urllib.request.urlopen(req, timeout=4) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    rates = data.get("rates", {})
                    if rates and "INR" in rates and "EUR" in rates:
                        self._cache.update(rates)
                        self._last_fetched = time.time()
                        self._source = "Open Exchange Rates API (Live)"
                        self._is_live = True
                        logger.info("Live exchange rates successfully updated.")
                        return True
        except Exception as e:
            logger.debug(f"Live exchange rates fetch skipped or timed out: {e}. Using sandbox rates.")
        
        self._source = "NAVORA Sandbox Benchmark"
        self._is_live = False
        return False

    def get_rates(self, base_currency: str = "USD") -> Dict[str, Any]:
        """Returns exchange rates relative to the requested base currency."""
        now = time.time()
        if (now - self._last_fetched) > self._cache_ttl:
            self._fetch_live_rates()
            self._last_fetched = now

        base_curr = base_currency.upper()
        usd_to_base = self._cache.get(base_curr, 1.0)

        # Normalize relative to base_curr
        normalized_rates = {}
        for curr, rate in self._cache.items():
            normalized_rates[curr] = round(rate / usd_to_base, 6)

        return {
            "base_currency": base_curr,
            "rates": normalized_rates,
            "source": self._source,
            "is_live": self._is_live,
            "timestamp": int(self._last_fetched or time.time()),
            "supported_currencies": list(CURRENCY_SYMBOLS.keys()),
            "symbols": CURRENCY_SYMBOLS
        }

    def convert(
        self,
        amount: float,
        from_currency: str,
        to_currency: str
    ) -> Dict[str, Any]:
        """Performs decimal-precise currency conversion with full audit metadata."""
        from_curr = from_currency.upper()
        to_curr = to_currency.upper()

        if from_curr == to_curr:
            return {
                "original_amount": amount,
                "original_currency": from_curr,
                "converted_amount": amount,
                "converted_currency": to_curr,
                "exchange_rate": 1.0,
                "source": self._source,
                "is_live": self._is_live,
                "timestamp": int(self._last_fetched or time.time())
            }

        rates_data = self.get_rates("USD")["rates"]
        rate_from = rates_data.get(from_curr, SANDBOX_EXCHANGE_RATES.get(from_curr, 1.0))
        rate_to = rates_data.get(to_curr, SANDBOX_EXCHANGE_RATES.get(to_curr, 1.0))

        # Decimal arithmetic
        dec_amount = Decimal(str(amount))
        dec_rate_from = Decimal(str(rate_from))
        dec_rate_to = Decimal(str(rate_to))

        # USD = amount / rate_from; target = USD * rate_to
        conversion_rate = dec_rate_to / dec_rate_from
        converted_dec = (dec_amount * conversion_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        return {
            "original_amount": float(dec_amount),
            "original_currency": from_curr,
            "converted_amount": float(converted_dec),
            "converted_currency": to_curr,
            "exchange_rate": float(conversion_rate.quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP)),
            "source": self._source,
            "is_live": self._is_live,
            "timestamp": int(self._last_fetched or time.time())
        }


# Global instance
exchange_rate_provider = ExchangeRateProvider()
