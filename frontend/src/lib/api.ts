import { AuthResponse } from './types';

const API_BASE = 
  typeof window === 'undefined'
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://navora-ai-g4ec.onrender.com')
    : (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://navora-ai-g4ec.onrender.com');

class ApiClient {
  private get token(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    let response: Response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, config);
    } catch (err: any) {
      // Automatic retry for backend cold starts (Render free tier)
      try {
        await new Promise((res) => setTimeout(res, 2000));
        response = await fetch(`${API_BASE}${endpoint}`, config);
      } catch (retryErr: any) {
        throw new Error(`Connection error: Unable to reach NAVORA API server (${retryErr.message || err.message || 'Server waking up'}). Please try again in a few seconds.`);
      }
    }

    const text = await response.text();

    if (!response.ok) {
      let message = '';
      if (text) {
        try {
          const errorData = JSON.parse(text);
          if (typeof errorData.detail === 'string') {
            message = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            message = errorData.detail.map((e: any) => e.msg || (typeof e === 'string' ? e : JSON.stringify(e))).join(', ');
          } else if (typeof errorData.message === 'string') {
            message = errorData.message;
          } else if (typeof errorData.detail === 'object' && errorData.detail !== null) {
            message = JSON.stringify(errorData.detail);
          } else {
            message = text;
          }
        } catch {
          message = text;
        }
      }
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    if (!text) return {} as T;

    try {
      return JSON.parse(text);
    } catch {
      return text as unknown as T;
    }
  }

  // --- Auth Methods ---
  async login(payload: { identifier?: string; username?: string; password?: string } | FormData): Promise<AuthResponse> {
    let body: any;
    if (payload instanceof FormData) {
      const identifier = payload.get('identifier') || payload.get('username') || '';
      const password = payload.get('password') || '';
      body = JSON.stringify({ identifier, password });
    } else {
      const identifier = payload.identifier || payload.username || '';
      body = JSON.stringify({ identifier, password: payload.password });
    }

    return this.fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body,
    });
  }

  async register(data: { full_name: string; email?: string; phone?: string; password: string }): Promise<any> {
    return this.fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOtp(identifier: string, code: string, purpose: string = 'registration'): Promise<any> {
    return this.fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, code, purpose }),
    });
  }

  async resendOtp(identifier: string, purpose: string = 'registration'): Promise<any> {
    return this.fetch('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, purpose }),
    });
  }

  async getMe(): Promise<any> {
    return this.fetch('/api/auth/me');
  }

  async forgotPassword(identifier: string): Promise<any> {
    return this.fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, purpose: 'password_reset' }),
    });
  }

  async resetPassword(data: { identifier: string; code: string; new_password: string }): Promise<any> {
    return this.fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<any> {
    try {
      await this.fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // --- Catalog & Destinations ---
  async getDestinations(category?: string, search?: string, limit: number = 50): Promise<any[]> {
    const params = new URLSearchParams();
    if (category && category.toLowerCase() !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    params.set('limit', limit.toString());

    return this.fetch<any[]>(`/api/destinations?${params.toString()}`);
  }

  async getDestination(slugOrId: string): Promise<any> {
    return this.fetch<any>(`/api/destinations/${encodeURIComponent(slugOrId)}`);
  }

  // --- Compare Center ---
  async getCompare(destination: string, tab: string = 'All', origin: string = 'New York, USA', excludeFlights: boolean = false): Promise<any> {
    const params = new URLSearchParams({
      destination,
      tab,
      origin,
      exclude_flights: String(excludeFlights),
    });
    return this.fetch<any>(`/api/compare?${params.toString()}`);
  }

  // --- Trips & Planning ---
  async getTrips(): Promise<any[]> {
    return this.fetch<any[]>('/api/trips');
  }

  async getTrip(tripId: string): Promise<any> {
    return this.fetch<any>(`/api/trips/${tripId}`);
  }

  async createTrip(data: any): Promise<any> {
    return this.fetch<any>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generatePlans(tripId: string): Promise<any> {
    return this.fetch<any>(`/api/planning/${tripId}/generate-plans`, {
      method: 'POST',
    });
  }

  async selectPlan(tripId: string, planTier: string): Promise<any> {
    return this.fetch<any>(`/api/planning/${tripId}/select-plan?plan_tier=${encodeURIComponent(planTier)}`, {
      method: 'POST',
    });
  }

  async getTripItinerary(tripId: string): Promise<any> {
    return this.fetch<any>(`/api/trips/${tripId}/itinerary`);
  }

  // --- Bookings & Payments ---
  async getBookings(tripId?: string): Promise<any[]> {
    const url = tripId ? `/api/bookings?trip_id=${tripId}` : '/api/bookings';
    return this.fetch<any[]>(url);
  }

  async createBooking(data: any): Promise<any> {
    return this.fetch<any>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelBooking(bookingId: string): Promise<any> {
    return this.fetch<any>(`/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
  }

  async createPaymentOrder(data: { trip_id: string; amount: number; currency: string; booking_id?: string }): Promise<any> {
    return this.fetch<any>('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: { order_id: string; payment_id: string; signature: string }): Promise<any> {
    return this.fetch<any>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Group Collaboration & Expenses ---
  async getTripMembers(tripId: string): Promise<any[]> {
    return this.fetch<any[]>(`/api/groups/${tripId}/members`);
  }

  async generateInvite(tripId: string): Promise<any> {
    return this.fetch<any>(`/api/groups/${tripId}/invite`, {
      method: 'POST',
    });
  }

  async getExpenses(tripId: string): Promise<any[]> {
    return this.fetch<any[]>(`/api/expenses/${tripId}`);
  }

  async getSettlement(tripId: string): Promise<any[]> {
    return this.fetch<any[]>(`/api/expenses/${tripId}/settlement`);
  }

  async addExpense(data: any): Promise<any> {
    return this.fetch<any>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Rewards / Coins ---
  async getWallet(): Promise<any> {
    return this.fetch<any>('/api/coins/wallet');
  }

  async getCoins(): Promise<any> {
    return this.getWallet();
  }

  async redeemCoins(coinsToRedeem: number, rewardType: string = 'travel_credit'): Promise<any> {
    return this.fetch<any>('/api/coins/redeem', {
      method: 'POST',
      body: JSON.stringify({ amount: coinsToRedeem, purpose: rewardType }),
    });
  }

  // --- Compare Matrix Alias ---
  async getCompareMatrix(destination: string, tab: string = 'All', origin: string = 'New York, USA', excludeFlights: boolean = false): Promise<any> {
    return this.getCompare(destination, tab, origin, excludeFlights);
  }

  // --- Trip Monitor & Replanning ---
  async getMonitor(tripId: string): Promise<any> {
    return this.fetch<any>(`/api/monitor/${tripId}`);
  }

  async triggerReplanning(data: { trip_id: string; disruption_type: string; disruption_details: any }): Promise<any> {
    return this.fetch<any>('/api/replanning/trigger', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveReplanning(data: { proposal_id: string; trip_id: string; selected_alternative_id?: string; approved_plan_tier?: string }): Promise<any> {
    return this.fetch<any>('/api/replanning/approve', {
      method: 'POST',
      body: JSON.stringify({
        proposal_id: data.proposal_id,
        trip_id: data.trip_id,
        selected_alternative_id: data.selected_alternative_id || data.approved_plan_tier || 'alt_optimal',
        approved_plan_tier: data.approved_plan_tier,
      }),
    });
  }

  // --- Travel Intelligence & Weather ---
  async getWeather(destination: string): Promise<any> {
    return this.fetch<any>(`/api/weather?destination=${encodeURIComponent(destination)}`);
  }

  // --- AI Concierge ---
  async chatAI(query: string, language: string = 'en', currentDestination?: string, tripId?: string): Promise<any> {
    return this.fetch<any>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        query,
        language,
        current_destination: currentDestination,
        trip_id: tripId,
      }),
    });
  }

  async chatWithAI(data: { query: string; language?: string; current_destination?: string; trip_id?: string }): Promise<any> {
    return this.chatAI(data.query, data.language || 'en', data.current_destination, data.trip_id);
  }
}

export const api = new ApiClient();
