import { Schema, model, models, type InferSchemaType } from "mongoose";

export const CLIENT_EVENT_TYPES = ["link_view", "google_click"] as const;

const clientEventSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: CLIENT_EVENT_TYPES,
      required: true,
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: "",
    },
    referrer: {
      type: String,
      trim: true,
      default: "",
    },
    userAgent: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

clientEventSchema.index({ clientId: 1, type: 1, createdAt: -1 });
clientEventSchema.index({ userId: 1, createdAt: -1 });

export type ClientEventDocument = InferSchemaType<typeof clientEventSchema> & {
  _id: string;
};

const ClientEvent =
  models.ClientEvent || model("ClientEvent", clientEventSchema);

export default ClientEvent;
