import os
import json
from typing import List, Dict, Any, Optional

class RevisionCheckerService:
    def __init__(self, data_path: Optional[str] = None):
        if not data_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_path = os.path.join(base_dir, "data", "standards.json")
            if not os.path.exists(data_path):
                # Fallback to root data folder
                data_path = os.path.join(os.path.dirname(base_dir), "data", "indian_standards_dataset.json")

        self.data_path = data_path
        self.standards: List[Dict[str, Any]] = []
        self._standards_by_id: Dict[str, Dict[str, Any]] = {}
        self._standards_by_is_num: Dict[str, Dict[str, Any]] = {}
        self._standards_by_base_num: Dict[str, List[Dict[str, Any]]] = {}
        self._load_dataset()

    def _load_dataset(self):
        if not os.path.exists(self.data_path):
            print(f"Warning: Standards dataset not found at {self.data_path}")
            return
        
        with open(self.data_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
            self.standards = raw_data

        for std in self.standards:
            self._standards_by_id[std["id"]] = std
            
            # Key normalized standard number (e.g. "IS 1786:2008")
            norm_is = self._normalize_key(std["is_number"])
            self._standards_by_is_num[norm_is] = std
            
            # Base standard number (e.g. "IS 1786")
            base = self._normalize_key(std.get("base_number", std["is_number"].split(":")[0]))
            if base not in self._standards_by_base_num:
                self._standards_by_base_num[base] = []
            self._standards_by_base_num[base].append(std)

    def _normalize_key(self, is_str: str) -> str:
        if not is_str:
            return ""
        # Lowercase, remove spaces, colons, hyphens, parentheses
        s = is_str.upper()
        s = s.replace(" ", "").replace(":", "").replace("-", "").replace("(", "").replace(")", "").replace("PART", "P")
        return s

    def get_all_standards(self) -> List[Dict[str, Any]]:
        return self.standards

    def get_standard_by_id(self, std_id: str) -> Optional[Dict[str, Any]]:
        return self._standards_by_id.get(std_id)

    def find_standard_by_is_number(self, is_str: str) -> Optional[Dict[str, Any]]:
        norm = self._normalize_key(is_str)
        if norm in self._standards_by_is_num:
            return self._standards_by_is_num[norm]
        
        # Try finding by exact match in raw dataset
        for s in self.standards:
            if self._normalize_key(s["is_number"]) == norm:
                return s
        return None

    def find_active_replacement(self, std: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Traverses the revision timeline graph to locate the active replacement standard.
        """
        if std.get("status") == "Current":
            return std

        # If superseded_by is explicitly stated
        superseded_by_is = std.get("superseded_by")
        if superseded_by_is:
            rep = self.find_standard_by_is_number(superseded_by_is)
            if rep:
                return self.find_active_replacement(rep)

        # Look in base number cluster for the current edition
        base = self._normalize_key(std.get("base_number", std["is_number"].split(":")[0]))
        cluster = self._standards_by_base_num.get(base, [])
        current_candidates = [s for s in cluster if s.get("status") == "Current"]
        if current_candidates:
            # Pick highest edition year
            return sorted(current_candidates, key=lambda x: x.get("current_edition_year", 0), reverse=True)[0]

        return None

    def search_standards(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = self.standards
        if category and category != "all":
            results = [s for s in results if s["category"].lower() == category.lower()]
        if status and status != "all":
            results = [s for s in results if s["status"].lower() == status.lower()]
        
        if query:
            q = query.lower().strip()
            filtered = []
            for s in results:
                match = (
                    q in s["is_number"].lower() or
                    q in s["title"].lower() or
                    q in s["scope"].lower() or
                    any(q in kw.lower() for kw in s.get("keywords", [])) or
                    any(q in p.lower() for p in s.get("applicable_products", []))
                )
                if match:
                    filtered.append(s)
            results = filtered
        return results

    def get_catalog_stats(self) -> Dict[str, Any]:
        total = len(self.standards)
        current = sum(1 for s in self.standards if s.get("status") == "Current")
        superseded = sum(1 for s in self.standards if s.get("status") == "Superseded")
        withdrawn = sum(1 for s in self.standards if s.get("status") == "Withdrawn")
        
        cats: Dict[str, int] = {}
        for s in self.standards:
            c = s.get("category", "General")
            cats[c] = cats.get(c, 0) + 1

        return {
            "total_standards": total,
            "current_standards": current,
            "superseded_standards": superseded,
            "withdrawn_standards": withdrawn,
            "category_distribution": cats
        }
