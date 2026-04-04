import { Schema, model, models, type InferSchemaType } from "mongoose";

const billingEventSchema = new Schema(
  {
    eventKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export type BillingEventDocument = InferSchemaType<typeof billingEventSchema> & {
  _id: string;
};

const BillingEvent =
  models.BillingEvent || model("BillingEvent", billingEventSchema);

export default BillingEvent;
