export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export interface Forecast {
  id: string;
  productId: string;
  storeId: string;
  forecast7d: number;
  forecast14d: number;
  forecast30d: number;
  restockNow: boolean;
  recommendedQty: number;
  bestReorderDay: string;
  seasonalNote?: string;
  confidence: ConfidenceLevel;
  reasoning: string;
  generatedAt: string;
}

export interface GenerateForecastRequest {
  productId: string;
}

export interface ForecastResponse {
  forecast_7d: number;
  forecast_14d: number;
  forecast_30d: number;
  restock_now: boolean;
  recommended_qty: number;
  best_reorder_day: string;
  seasonal_note?: string;
  confidence: ConfidenceLevel;
  reasoning: string;
}
