import uuid
from typing import Dict, Any, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.trip import Trip, Itinerary, ItineraryItem
from app.models.intelligence import TripAlert
from app.models.community import Notification
from app.models.ai import AIAction
from app.schemas.ai import AIReplanningProposal, ReplanningAlternative, ReplanningApprovalRequest
from app.agents.orchestrator import orchestrator


class ReplanningService:
    def trigger_disruption_analysis(
        self,
        db: Session,
        trip_id: str,
        disruption_type: str,
        details: Dict[str, Any]
    ) -> AIReplanningProposal:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

        # Delegate analysis to Replanning Agent in Orchestrator
        replan_res = orchestrator.replanning_agent.evaluate_disruption(trip_id, disruption_type, details)

        proposal_id = str(uuid.uuid4())
        alternatives = [ReplanningAlternative(**alt) for alt in replan_res["alternatives"]]

        # Persist a TripAlert
        alert = TripAlert(
            trip_id=trip.id,
            alert_type=disruption_type,
            severity=replan_res["alert_severity"],
            title=f"Disruption Signal: {details.get('item_title', 'Transit')} Delayed",
            message=replan_res["impact_summary"],
            downstream_impact=replan_res["downstream_impact"],
            recommended_action={"proposal_id": proposal_id, "default_choice": alternatives[0].id}
        )
        db.add(alert)

        # Log AI Action awaiting approval
        action = AIAction(
            trip_id=trip.id,
            user_id=trip.creator_id,
            agent_name="ReplanningAgent",
            action_type="evaluate_disruption",
            tool_name="evaluate_disruption",
            input_parameters={"disruption_type": disruption_type, "details": details},
            result_payload=replan_res,
            approval_required=True,
            approval_status="pending"
        )
        db.add(action)
        db.commit()

        return AIReplanningProposal(
            proposal_id=proposal_id,
            trip_id=trip.id,
            alert_severity=replan_res["alert_severity"],
            impact_summary=replan_res["impact_summary"],
            affected_items=["Afternoon Guided Tour", "Waterfront Dinner Reservation"],
            alternatives=alternatives,
            recommended_alternative_id=alternatives[0].id,
            requires_user_approval=True
        )

    def process_approval(
        self,
        db: Session,
        user_id: str,
        req: ReplanningApprovalRequest
    ) -> Dict[str, Any]:
        trip = db.query(Trip).filter(Trip.id == req.trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

        if not req.approved:
            return {"status": "declined", "message": "Replanning proposal rejected by user. Retaining current itinerary."}

        # Apply changes to active itinerary
        active_itinerary = db.query(Itinerary).filter(Itinerary.trip_id == trip.id, Itinerary.is_active == True).first()
        if active_itinerary:
            # Shift afternoon item
            items = active_itinerary.items
            for item in items:
                if item.time_slot == "Afternoon":
                    item.status = "Replanned"
                    item.title = f"[Rescheduled] {item.title}"
                    item.description = f"{item.description} (Optimized for schedule delay buffer)."

        # Mark alerts resolved
        db.query(TripAlert).filter(TripAlert.trip_id == trip.id).update({"is_resolved": True})

        # Broadcast update notification to members
        members = trip.members
        for m in members:
            notif = Notification(
                user_id=m.user_id,
                type="replanning",
                severity="INFO",
                title="Itinerary Updated & Protected",
                message=f"Schedule adjusted for transit delay on {trip.title}. Next activities updated seamlessly.",
                action_url=f"/trips/{trip.id}/itinerary"
            )
            db.add(notif)

        db.commit()

        return {
            "status": "success",
            "message": "AI Replanning proposal successfully approved and applied to your active itinerary!",
            "trip_id": trip.id
        }


replanning_service = ReplanningService()
