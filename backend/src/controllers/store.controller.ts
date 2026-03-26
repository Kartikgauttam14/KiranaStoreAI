import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Haversine formula to calculate distance between two coordinates in kilometers
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// POST /api/stores - Create a new store
export const createStore = async (req: AuthRequest, res: Response) => {
  try {
    const { name, latitude, longitude, address, city, pincode, phone, deliveryRadius, minOrderValue, gstNumber, fssaiNumber, openTime, closeTime } = req.body;

    // Validation
    if (!name || latitude === undefined || longitude === undefined || !address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, latitude, longitude, address, city, pincode',
      });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates: latitude must be -90 to 90, longitude must be -180 to 180',
      });
    }

    // Check if GST number already exists (if provided)
    if (gstNumber) {
      const existingStore = await prisma.store.findUnique({
        where: { gstNumber },
      });
      if (existingStore) {
        return res.status(400).json({
          success: false,
          error: 'GST number already registered',
        });
      }
    }

    const store = await prisma.store.create({
      data: {
        ownerId: req.userId!,
        name,
        latitude,
        longitude,
        address,
        city,
        pincode,
        phone: phone || null,
        deliveryRadius: deliveryRadius || 3.0,
        minOrderValue: minOrderValue || 100,
        gstNumber: gstNumber || null,
        fssaiNumber: fssaiNumber || null,
        openTime: openTime || '08:00',
        closeTime: closeTime || '22:00',
        isOpen: true,
        isActive: true,
        isApproved: true, // Auto-approve for now, can be changed to manual approval
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: store,
    });
  } catch (error: any) {
    console.error('Error creating store:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create store',
    });
  }
};

// GET /api/stores/my - Get owner's stores
export const getOwnerStores = async (req: AuthRequest, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      where: {
        ownerId: req.userId,
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            currentStock: true,
          },
          take: 5, // Limit to 5 products
        },
        _count: {
          select: {
            products: true,
            bills: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: stores,
      total: stores.length,
    });
  } catch (error: any) {
    console.error('Error fetching owner stores:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stores',
    });
  }
};

// GET /api/stores/:id - Get store by ID
export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            sku: true,
            costPrice: true,
            sellingPrice: true,
            currentStock: true,
            category: true,
            imageUrl: true,
            gstRate: true,
          },
        },
        _count: {
          select: {
            products: true,
            bills: true,
            orders: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error: any) {
    console.error('Error fetching store:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch store',
    });
  }
};

// PUT /api/stores/:id - Update store
export const updateStore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, address, city, pincode, phone, deliveryRadius, minOrderValue, openTime, closeTime, isOpen } =
      req.body;

    // Check if store exists and belongs to the user
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    if (store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only update your own stores',
      });
    }

    // Validate coordinates if provided
    if (latitude !== undefined || longitude !== undefined) {
      const lat = latitude !== undefined ? latitude : store.latitude;
      const lon = longitude !== undefined ? longitude : store.longitude;

      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({
          success: false,
          error: 'Invalid coordinates',
        });
      }
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        name: name || undefined,
        latitude: latitude !== undefined ? latitude : undefined,
        longitude: longitude !== undefined ? longitude : undefined,
        address: address || undefined,
        city: city || undefined,
        pincode: pincode || undefined,
        phone: phone || undefined,
        deliveryRadius: deliveryRadius !== undefined ? deliveryRadius : undefined,
        minOrderValue: minOrderValue !== undefined ? minOrderValue : undefined,
        openTime: openTime || undefined,
        closeTime: closeTime || undefined,
        isOpen: isOpen !== undefined ? isOpen : undefined,
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Store updated successfully',
      data: updatedStore,
    });
  } catch (error: any) {
    console.error('Error updating store:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update store',
    });
  }
};

// DELETE /api/stores/:id - Delete store (soft delete)
export const deleteStore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if store exists and belongs to the user
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    if (store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only delete your own stores',
      });
    }

    // Soft delete by marking as inactive
    await prisma.store.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting store:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete store',
    });
  }
};

// GET /api/stores/nearby - Find nearby stores using Haversine formula
export const getNearbyStores = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = '5' } = req.query;

    // Validation
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: lat and lng',
      });
    }

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const searchRadius = parseFloat(radius as string);

    // Validate coordinates
    if (isNaN(userLat) || isNaN(userLng) || isNaN(searchRadius)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinate or radius values',
      });
    }

    if (userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates: latitude must be -90 to 90, longitude must be -180 to 180',
      });
    }

    // Fetch all active stores
    const allStores = await prisma.store.findMany({
      where: {
        isActive: true,
        isApproved: true,
        isOpen: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    // Calculate distances and filter by radius using Haversine formula
    const nearbyStores = allStores
      .map((store) => ({
        ...store,
        distance: calculateDistance(userLat, userLng, store.latitude, store.longitude),
      }))
      .filter((store) => store.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance); // Sort by distance ascending

    res.json({
      success: true,
      data: nearbyStores,
      total: nearbyStores.length,
      searchCenter: {
        latitude: userLat,
        longitude: userLng,
        radiusKm: searchRadius,
      },
    });
  } catch (error: any) {
    console.error('Error finding nearby stores:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to find nearby stores',
    });
  }
};

// GET /api/stores/search/city - Search stores by city
export const searchStoresByCity = async (req: Request, res: Response) => {
  try {
    const { city, query } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: city',
      });
    }

    const stores = await prisma.store.findMany({
      where: {
        city: {
          equals: city as string,
          mode: 'insensitive',
        },
        isActive: true,
        isApproved: true,
        ...(query && {
          name: {
            contains: query as string,
            mode: 'insensitive',
          },
        }),
      },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
      take: 20,
    });

    res.json({
      success: true,
      data: stores,
      total: stores.length,
    });
  } catch (error: any) {
    console.error('Error searching stores by city:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search stores',
    });
  }
};

// PUT /api/stores/:id/status - Toggle store open/closed status
export const toggleStoreStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isOpen } = req.body;

    // Check if store exists and belongs to the user
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    if (store.ownerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only toggle your own stores',
      });
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        isOpen,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: `Store is now ${updatedStore.isOpen ? 'open' : 'closed'}`,
      data: updatedStore,
    });
  } catch (error: any) {
    console.error('Error toggling store status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle store status',
    });
  }
};

// PUT /api/stores/:id/rating - Update store rating
export const updateStoreRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating: must be between 0 and 5',
      });
    }

    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
      });
    }

    // Calculate new average rating
    const totalRatings = store.totalRatings + 1;
    const newRating = (store.rating * store.totalRatings + rating) / totalRatings;

    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        rating: parseFloat(newRating.toFixed(2)),
        totalRatings,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Rating updated successfully',
      data: {
        storeId: updatedStore.id,
        avgRating: updatedStore.rating,
        totalRatings: updatedStore.totalRatings,
      },
    });
  } catch (error: any) {
    console.error('Error updating store rating:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update rating',
    });
  }
};
