import { Schema, model, Document } from "mongoose";

export interface IPromoCode extends Document {
  code: string;
  discountPercentage: number;
  isActive: boolean;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const PromoCode = model<IPromoCode>("PromoCode", PromoCodeSchema);
