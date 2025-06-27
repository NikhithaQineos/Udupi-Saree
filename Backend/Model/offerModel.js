import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['category', 'product'],
    required: true,
  },
  targetIds: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType',
  }],
  offerType: {
    type: String,
    enum: ['percentage', 'rupees'],
    required: true,
  },
  offerValue: {
    type: Number,
    required: true,
  },
    validFrom: {
    type: Date,
    required: true,
  },
  
  validTill: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export const Offer = mongoose.model('Offer', offerSchema);
