
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Allowed values
export const ITEM_TYPES = ['Lost', 'Found'] as const;

export const ITEM_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Accessories',
  'Other',
] as const;

export const ITEM_STATUSES = ['Open', 'Returned'] as const;

// TypeScript types
export type ItemType = (typeof ITEM_TYPES)[number];
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
export type ItemStatus = (typeof ITEM_STATUSES)[number];

// Item interface
export interface ItemDocument extends Document {
  title: string;
  description: string;
  type: ItemType;
  category: ItemCategory;
  location: string;
  date: Date;
  status: ItemStatus;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Item Schema
const itemSchema = new Schema<ItemDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ITEM_TYPES as unknown as string[],
        message: `Type must be one of: ${ITEM_TYPES.join(', ')}`,
      },
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ITEM_CATEGORIES as unknown as string[],
        message: `Category must be one of: ${ITEM_CATEGORIES.join(', ')}`,
      },
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
    },

    status: {
      type: String,
      enum: {
        values: ITEM_STATUSES as unknown as string[],
        message: `Status must be one of: ${ITEM_STATUSES.join(', ')}`,
      },
      default: 'Open',
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const Item: Model<ItemDocument> =
  mongoose.model<ItemDocument>('Item', itemSchema);

export default Item;
