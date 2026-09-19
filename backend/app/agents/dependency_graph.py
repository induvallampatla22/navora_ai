from typing import Dict, List, Any

class DependencyGraph:
    """
    Manages cross-feature dependencies in the NAVORA AI Trip Orchestrator.
    When a feature is modified (e.g., transport), it calculates the cascading impacts
    on downstream features (e.g., budget, hotel check-in).
    """

    def __init__(self):
        # Maps a changed feature to a list of features that depend on it
        self.dependencies = {
            "transport": ["budget", "itinerary", "hotel_checkin"],
            "destination": ["transport", "hotel", "activity", "restaurant", "weather", "safety", "budget", "itinerary"],
            "budget": ["hotel", "activity", "transport"],
            "hotel": ["budget", "itinerary"],
            "activity": ["budget", "itinerary"],
            "restaurant": ["budget", "itinerary"],
            "travelers_count": ["budget", "hotel", "transport"]
        }

    def get_impacts(self, changed_feature: str) -> List[str]:
        """Returns a list of downstream features impacted by the changed feature."""
        return self.dependencies.get(changed_feature, [])

    def compute_cascading_impacts(self, changed_features: List[str]) -> List[str]:
        """Computes all cascading impacts from a list of initial changed features."""
        impacted = set()
        queue = changed_features.copy()

        while queue:
            current_feature = queue.pop(0)
            deps = self.get_impacts(current_feature)
            for dep in deps:
                if dep not in impacted and dep not in changed_features:
                    impacted.add(dep)
                    queue.append(dep)

        return list(impacted)


dependency_graph = DependencyGraph()
