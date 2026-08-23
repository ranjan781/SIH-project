"""
Indian Standards Catalog Service
Loads, searches, filters, and manages research standards dataset.
"""

import json
import os
from typing import List, Optional, Dict, Any
from backend.models.schemas import StandardRecord


class StandardsService:
    def __init__(self, data_path: Optional[str] = None):
        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_path = os.path.join(base_dir, "data", "indian_standards_dataset.json")
        
        self.data_path = data_path
        self.standards: List[StandardRecord] = []
        self._load_dataset()

    def _load_dataset(self):
        if os.path.exists(self.data_path):
            with open(self.data_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                self.standards = [StandardRecord(**item) for item in raw_data]
        else:
            self.standards = []

    def get_all(self) -> List[StandardRecord]:
        return self.standards

    def get_by_id(self, standard_id: str) -> Optional[StandardRecord]:
        for s in self.standards:
            if s.id.lower() == standard_id.lower():
                return s
        return None

    def find_by_is_number(self, is_num: str) -> Optional[StandardRecord]:
        """Look up by exact or normalized IS string like 'IS 1786:2008' or 'IS 9873(Part 4)'"""
        clean = is_num.replace(" ", "").replace(":", "").replace("-", "").upper()
        for s in self.standards:
            std_clean = s.is_number.replace(" ", "").replace(":", "").replace("-", "").upper()
            if clean == std_clean or clean in std_clean:
                return s
        return None

    def find_by_base_number(self, base_num: str) -> List[StandardRecord]:
        clean_base = base_num.replace(" ", "").upper()
        return [s for s in self.standards if s.base_number.replace(" ", "").upper() == clean_base]

    def get_latest_current_version(self, base_num_or_is: str) -> Optional[StandardRecord]:
        """Find the active/current edition for a given IS base or number"""
        matches = self.find_by_base_number(base_num_or_is)
        for m in matches:
            if m.status.lower() == "current":
                return m
        # If no current match by base, check if any superseded entry points to superseded_by
        direct = self.find_by_is_number(base_num_or_is)
        if direct and direct.superseded_by:
            return self.find_by_is_number(direct.superseded_by)
        return direct

    def search_and_filter(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
        year_min: Optional[int] = None,
        year_max: Optional[int] = None
    ) -> List[StandardRecord]:
        results = self.standards

        if category and category.lower() != "all":
            results = [s for s in results if s.category.lower() == category.lower()]

        if status and status.lower() != "all":
            results = [s for s in results if s.status.lower() == status.lower()]

        if year_min:
            results = [s for s in results if s.current_edition_year >= year_min]

        if year_max:
            results = [s for s in results if s.current_edition_year <= year_max]

        if query:
            q = query.strip().lower()
            q_clean = q.replace(" ", "").replace(":", "").replace("-", "")
            
            def matches_query(s: StandardRecord) -> bool:
                if q in s.is_number.lower() or q_clean in s.is_number.replace(" ", "").replace(":", "").replace("-", "").lower():
                    return True
                if q in s.title.lower():
                    return True
                if q in s.scope.lower():
                    return True
                if any(q in kw.lower() for kw in s.keywords):
                    return True
                if any(q in prod.lower() for prod in s.applicable_products):
                    return True
                return False

            results = [s for s in results if matches_query(s)]

        return results

    def get_categories(self) -> List[str]:
        return sorted(list({s.category for s in self.standards}))

    def get_statistics(self) -> Dict[str, Any]:
        total = len(self.standards)
        current = sum(1 for s in self.standards if s.status == "Current")
        superseded = sum(1 for s in self.standards if s.status == "Superseded")
        withdrawn = sum(1 for s in self.standards if s.status == "Withdrawn")
        
        categories = {}
        for s in self.standards:
            categories[s.category] = categories.get(s.category, 0) + 1

        return {
            "total_standards": total,
            "current_standards": current,
            "superseded_standards": superseded,
            "withdrawn_standards": withdrawn,
            "category_distribution": categories
        }


# Singleton instance
standards_service = StandardsService()
