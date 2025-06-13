# schemas/report.py

from pydantic import BaseModel
from typing import List, Optional, Union, Dict

class KeyMetric(BaseModel):
    label: str
    value: Union[float, int, str]
    changePercent: Optional[float] = None

class ChartDataset(BaseModel):
    label: str
    data: List[float]
    fill: Optional[bool] = False
    borderColor: Optional[str] = "blue"
    tension: Optional[float] = 0.1

class ChartData(BaseModel):
    labels: List[str]
    datasets: List[ChartDataset]

class ReportResponse(BaseModel):
    keyMetrics: List[KeyMetric]
    tableData: List[dict]
    totalRecords: int
    chartData: Optional[ChartData] = None

class PriceProfitOverTimeOut(BaseModel):
    date: str  # format: "YYYY-MM"
    total_price_bought: float
    total_price_sold: float
    profit: float