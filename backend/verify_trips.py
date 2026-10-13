import sys
import codecs
import json
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
from app.agents.lyzr_meeting_orchestrator import lyzr_orchestrator

def main():
    print("=== TEST A: 10-day France trip from India, budget Rs 5,000 ===")
    res_a = lyzr_orchestrator.process_omi_voice_stream(
        transcript_text="Plan a 10-day France trip from India with a budget of Rs 5,000 per person."
    )
    act_a = res_a.get("autonomous_action") or {}
    plan_a = (act_a.get("results") or [{}])[0]
    print("Action Type:", act_a.get("action_type"))
    print("Destination:", act_a.get("destination"))
    print("Duration:", act_a.get("duration_days"), "days")
    print("Budget extracted:", act_a.get("budget"))
    fit_summary_a = plan_a.get("budget_fit_summary") or {}
    print("Is Feasible:", fit_summary_a.get("is_feasible"))
    print("Verdict:", fit_summary_a.get("verdict"))
    breakdown_a = plan_a.get("budget_breakdown") or {}
    print("Total Estimated:", breakdown_a.get("total_estimated"))
    print("Flights min:", breakdown_a.get("roundtrip_flights"))
    print("Fits within budget:", breakdown_a.get("fits_within_budget"))

    print("\n=== TEST B: 15-day France trip from India, budget Rs 4 lakh ===")
    res_b = lyzr_orchestrator.process_omi_voice_stream(
        transcript_text="Plan a 15-day France trip from India with a budget of Rs 4 lakh per person."
    )
    act_b = res_b.get("autonomous_action") or {}
    plan_b = (act_b.get("results") or [{}])[0]
    print("Action Type:", act_b.get("action_type"))
    print("Destination:", act_b.get("destination"))
    print("Duration:", act_b.get("duration_days"), "days")
    print("Budget extracted:", act_b.get("budget"))
    fit_summary_b = plan_b.get("budget_fit_summary") or {}
    print("Is Feasible:", fit_summary_b.get("is_feasible"))
    print("Verdict:", fit_summary_b.get("verdict"))
    breakdown_b = plan_b.get("budget_breakdown") or {}
    print("Total Estimated:", breakdown_b.get("total_estimated"))
    print("Allocated Budget:", breakdown_b.get("allocated_budget"))
    print("Fits within budget:", breakdown_b.get("fits_within_budget"))
    days_b = plan_b.get("day_by_day") or []
    print("Days count in itinerary:", len(days_b))
    alt_plans = plan_b.get("alternative_plans") or []
    print("Plans count:", len(alt_plans))
    for p in alt_plans:
        print(f"  - {p.get('tier')}: {p.get('title')} -> {p.get('estimated_cost')}")

    print("\nDay 1 sample activity:")
    if days_b:
        d1 = days_b[0]
        print(f"Day 1 Title: {d1.get('title')}")
        m = d1.get("morning", {})
        print(f"  [Morning] {m.get('activity')} - {m.get('description')} (Duration: {m.get('duration')}, Cost: {m.get('entry_fee')})")
        a = d1.get("afternoon", {})
        print(f"  [Afternoon] {a.get('activity')} - {a.get('description')} (Duration: {a.get('duration')}, Cost: {a.get('entry_fee')})")
        e = d1.get("evening", {})
        print(f"  [Evening] {e.get('activity')} - {e.get('description')} (Duration: {e.get('duration')}, Cost: {e.get('entry_fee')})")

    print("\nDay 8 sample (French Riviera / Nice):")
    if len(days_b) >= 8:
        d8 = days_b[7]
        print(f"Day 8 Title: {d8.get('title')}")
        m = d8.get("morning", {})
        print(f"  [Morning] {m.get('activity')} - {m.get('description')} (Duration: {m.get('duration')}, Cost: {m.get('entry_fee')})")
        e = d8.get("evening", {})
        print(f"  [Evening] {e.get('activity')} - {e.get('description')} (Duration: {e.get('duration')}, Cost: {e.get('entry_fee')})")

    print("\n=== TEST C: Book a train ticket from Chirala to Hyderabad ===")
    res_c = lyzr_orchestrator.process_omi_voice_stream(
        transcript_text="Book a train ticket from Chirala to Hyderabad."
    )
    act_c = res_c.get("autonomous_action") or {}
    print("Action Type:", act_c.get("action_type"))
    print("Action Description:", act_c.get("action_description"))
    print("Origin:", act_c.get("origin"))
    print("Destination:", act_c.get("destination"))
    print("Options Found:", act_c.get("options_found"))

if __name__ == "__main__":
    main()

