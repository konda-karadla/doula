import re
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class BiomarkerParserService:
    def __init__(self):
        self.patterns = [
            r'(\w+(?:\s+\w+)*)\s+(\d+\.?\d*)\s+(\w+(?:/\w+)?)\s+(\d+\.?\d*)\s*-\s*(\d+\.?\d*)',
            r'(\w+(?:\s+\w+)*)\s*:\s*(\d+\.?\d*)\s*(\w+(?:/\w+)?)',
        ]

    def parse_biomarkers_from_text(self, text: str) -> List[Dict[str, Optional[str]]]:
        biomarkers = []

        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue

            for pattern in self.patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    groups = match.groups()
                    if len(groups) >= 3:
                        biomarker = {
                            'testName': groups[0].strip(),
                            'value': groups[1].strip(),
                            'unit': groups[2].strip() if len(groups) > 2 else None,
                            'referenceRangeLow': groups[3].strip() if len(groups) > 3 else None,
                            'referenceRangeHigh': groups[4].strip() if len(groups) > 4 else None,
                        }
                        biomarkers.append(biomarker)
                        break

        logger.info(f"Parsed {len(biomarkers)} biomarkers from text")
        return biomarkers
