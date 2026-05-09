import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SA Bookings API',
      version: '1.0.0',
      description: 'Enterprise accommodation booking API for South Africa',
      contact: {
        name: 'API Support',
        email: 'support@sabookings.co.za',
      },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
      { url: 'https://api.sabookings.co.za', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['tourist', 'host', 'admin'] },
            phone: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Accommodation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['hotel', 'lodge', 'guesthouse', 'bed_and_breakfast', 'apartment', 'villa', 'cottage', 'backpacker', 'camping', 'game_lodge'] },
            province: { type: 'string', enum: ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'] },
            city: { type: 'string' },
            pricePerNight: { type: 'number' },
            maxGuests: { type: 'integer' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
            amenities: { type: 'array', items: { type: 'string' } },
            images: { type: 'array', items: { type: 'string' } },
            averageRating: { type: 'number' },
            isAvailable: { type: 'boolean' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            reference: { type: 'string' },
            checkIn: { type: 'string', format: 'date' },
            checkOut: { type: 'string', format: 'date' },
            guests: { type: 'integer' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'] },
            isPaid: { type: 'boolean' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
            totalCount: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPreviousPage: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Accommodations', description: 'Accommodation management' },
      { name: 'Bookings', description: 'Booking operations' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Reviews', description: 'Review management' },
      { name: 'Admin', description: 'Admin operations' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
