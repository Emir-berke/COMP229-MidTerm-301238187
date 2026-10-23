
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Item, {
  ITEM_TYPES,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
} from '../models/Item.js';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<Response | void>;

const handleError = (error: unknown, res: Response): Response => {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ error: error.message });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  ) {
    return res.status(409).json({
      error: 'An item with this title already exists',
    });
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
};

const validId = (id: string): boolean =>
  /^[a-fA-F0-9]{24}$/.test(id);

const allowedFields = [
  'title',
  'description',
  'type',
  'category',
  'location',
  'date',
  'status',
];

const validateInput = (
  body: any,
  creating: boolean
): string | null => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object';
  }

  const keys = Object.keys(body);

  if (keys.some((key) => !allowedFields.includes(key))) {
    return 'Request contains unsupported fields';
  }

  if (!creating && keys.length === 0) {
    return 'At least one field is required';
  }

  if (creating) {
    for (const field of [
      'title',
      'description',
      'type',
      'category',
      'location',
      'date',
    ]) {
      if (body[field] === undefined || body[field] === null) {
        return `${field} is required`;
      }
    }
  }

  for (const field of ['title', 'description', 'location']) {
    if (body[field] !== undefined) {
      if (
        typeof body[field] !== 'string' ||
        !body[field].trim()
      ) {
        return `${field} must be a non-empty string`;
      }
    }
  }

  if (body.type !== undefined && !ITEM_TYPES.includes(body.type)) {
    return 'Invalid item type';
  }

  if (
    body.category !== undefined &&
    !ITEM_CATEGORIES.includes(body.category)
  ) {
    return 'Invalid item category';
  }

  if (
    body.status !== undefined &&
    !ITEM_STATUSES.includes(body.status)
  ) {
    return 'Invalid item status';
  }

  if (body.date !== undefined) {
    if (
      typeof body.date !== 'string' ||
      !body.date.trim() ||
      Number.isNaN(Date.parse(body.date))
    ) {
      return 'Invalid date';
    }
  }

  return null;
};

// GET /api/items
export const listItems: AsyncHandler = async (req, res) => {
  try {
    const filter: Record<string, string> = {};

    if (req.query.type !== undefined) {
      if (
        typeof req.query.type !== 'string' ||
        !ITEM_TYPES.includes(req.query.type as any)
      ) {
        return res.status(400).json({ error: 'Invalid type filter' });
      }
      filter.type = req.query.type;
    }

    if (req.query.category !== undefined) {
      if (
        typeof req.query.category !== 'string' ||
        !ITEM_CATEGORIES.includes(req.query.category as any)
      ) {
        return res.status(400).json({ error: 'Invalid category filter' });
      }
      filter.category = req.query.category;
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    return handleError(error, res);
  }
};

// GET /api/items/mine
export const listMyItems: AsyncHandler = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const items = await Item.find({ owner: req.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json(items);
  } catch (error) {
    return handleError(error, res);
  }
};

// GET /api/items/:id
export const getItemById: AsyncHandler = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.status(200).json(item);
  } catch (error) {
    return handleError(error, res);
  }
};

// POST /api/items
export const createItem: AsyncHandler = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validationError = validateInput(req.body, true);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const title = req.body.title.trim();

    const duplicate = await Item.findOne({ title });

    if (duplicate) {
      return res.status(409).json({
        error: 'An item with this title already exists',
      });
    }

    const item = await Item.create({
      ...req.body,
      title,
      owner: req.userId,
    });

    return res.status(201).json(item);
  } catch (error) {
    return handleError(error, res);
  }
};

// PUT /api/items/:id
export const updateItem: AsyncHandler = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!validId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const validationError = validateInput(req.body, false);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'You are not the owner of this item',
      });
    }

    if (req.body.title !== undefined) {
      const title = req.body.title.trim();

      const duplicate = await Item.findOne({
        title,
        _id: { $ne: item._id },
      });

      if (duplicate) {
        return res.status(409).json({
          error: 'An item with this title already exists',
        });
      }
    }

    Object.assign(item, req.body);
    await item.save();

    return res.status(200).json(item);
  } catch (error) {
    return handleError(error, res);
  }
};

// DELETE /api/items/mine
export const deleteMyItems: AsyncHandler = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await Item.deleteMany({
      owner: req.userId,
    });

    return res.status(200).json({
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// DELETE /api/items/:id
export const deleteItem: AsyncHandler = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!validId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'You are not the owner of this item',
      });
    }

    await item.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return handleError(error, res);
  }
};

export { Item };
