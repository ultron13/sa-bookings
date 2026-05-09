import { test, expect, Page } from '@playwright/test';

const API_BASE = 'http://localhost:4000/api/v1';

const mockAccommodations = {
  success: true,
  data: [
    {
      id: 'acc-1',
      name: 'Table Mountain Lodge',
      description: 'Luxurious lodge with views of Table Mountain.',
      type: 'lodge',
      province: 'Western Cape',
      city: 'Cape Town',
      address: '1 Lodge Road',
      pricePerNight: 3500,
      cleaningFee: 500,
      serviceFee: 350,
      maxGuests: 4,
      bedrooms: 2, beds: 3, bathrooms: 2,
      amenities: ['wifi', 'pool', 'parking', 'restaurant'],
      images: [], thumbnailUrl: '',
      averageRating: 4.8,
      reviewCount: 42,
      isAvailable: true, isFeatured: true,
      checkInTime: '14:00', checkOutTime: '11:00',
      cancellationPolicy: { type: 'flexible', description: 'Free cancellation', refundPercentage: 100 },
      houseRules: [], isActive: true, hostId: 'host-1',
      createdAt: '2026-01-01', updatedAt: '2026-01-01',
      latitude: -33.96, longitude: 18.41,
    },
    {
      id: 'acc-2',
      name: 'Kruger Safari Camp',
      description: 'Premium safari camp bordering Kruger National Park.',
      type: 'game_lodge',
      province: 'Mpumalanga',
      city: 'Nelspruit',
      address: 'Sabi Sand Reserve',
      pricePerNight: 8500,
      cleaningFee: 0, serviceFee: 850,
      maxGuests: 8, bedrooms: 4, beds: 8, bathrooms: 4,
      amenities: ['wifi', 'pool', 'safari', 'restaurant'],
      images: [],
      averageRating: 4.9, reviewCount: 28,
      isAvailable: true, isFeatured: true,
      checkInTime: '12:00', checkOutTime: '10:00',
      cancellationPolicy: { type: 'strict', description: '50% refund', refundPercentage: 50 },
      houseRules: [], isActive: true, hostId: 'host-1',
      createdAt: '2026-01-01', updatedAt: '2026-01-01',
      latitude: -24.98, longitude: 31.48,
    },
  ],
  meta: { page: 1, pageSize: 20, totalCount: 2, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
};

const mockProvinceCounts = {
  success: true,
  data: [
    { province: 'Western Cape', count: 15 },
    { province: 'Gauteng', count: 12 },
  ],
};

async function setupApiMocks(page: Page) {
  await page.route('**/api/v1/accommodations/search**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAccommodations) });
  });
  await page.route('**/api/v1/accommodations/featured', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAccommodations) });
  });
  await page.route('**/api/v1/accommodations/province-counts', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProvinceCounts) });
  });
  await page.route('**/api/v1/reviews/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }) });
  });
  await page.route('**/api/v1/accommodations/acc-1', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockAccommodations.data[0] }) });
  });
}

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display the hero section with title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Discover South Africa');
  });

  test('should display the search form', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Search")')).toBeVisible();
  });

  test('should display the Explore by Province section', async ({ page }) => {
    await expect(page.getByText('Explore by Province')).toBeVisible();
  });

  test('should navigate to search on province click', async ({ page }) => {
    const provinceLink = page.locator('a[href*="province="] >> visible=true').first();
    await expect(provinceLink).toBeVisible();
    await provinceLink.click();
    await page.waitForURL('**/accommodations**');
  });

  test('should navigate to search on search button click', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('beach');
    await page.locator('button[type="submit"]:has-text("Search")').click();
    await expect(page).toHaveURL(/.*q=beach/);
  });
});

test.describe('Accommodation Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/accommodations/search**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAccommodations) });
    });
    await page.route('**/api/v1/accommodations/acc-*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockAccommodations.data[0] }) });
    });
    await page.route('**/api/v1/accommodations/province-counts', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProvinceCounts) });
    });
    await page.route('**/api/v1/reviews/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }) });
    });
    await page.goto('/accommodations');
    await page.waitForLoadState('networkidle');
  });

  test('should display search results', async ({ page }) => {
    await expect(page.getByText('Table Mountain Lodge')).toBeVisible();
    await expect(page.getByText('Kruger Safari Camp')).toBeVisible();
  });

  test('should display filter sidebar', async ({ page }) => {
    await expect(page.locator('h2:has-text("Filters")')).toBeVisible();
    await expect(page.locator('label:has-text("Province")')).toBeVisible();
    await expect(page.locator('label:has-text("Type")')).toBeVisible();
  });

  test('should show property count', async ({ page }) => {
    await expect(page.getByText(/properties found/)).toBeVisible();
  });

  test('should navigate to detail page on card click', async ({ page }) => {
    await page.getByText('Table Mountain Lodge').click();
    await expect(page).toHaveURL(/.*\/accommodations\/acc-1/);
  });
});

test.describe('Accommodation Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/accommodations/acc-1', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockAccommodations.data[0] }) });
    });
    await page.route('**/api/v1/reviews/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], meta: { total: 0 } }) });
    });
    await page.goto('/accommodations/acc-1');
    await page.waitForLoadState('networkidle');
  });

  test('should display accommodation details', async ({ page }) => {
    await expect(page.getByText('Table Mountain Lodge')).toBeVisible();
    await expect(page.getByText('Luxurious lodge with views')).toBeVisible();
  });

  test('should display amenities section', async ({ page }) => {
    await expect(page.getByText('Amenities')).toBeVisible();
    await expect(page.getByText('Wifi')).toBeVisible();
  });

  test('should display price per night', async ({ page }) => {
    await page.getByText('Table Mountain Lodge').waitFor();
    await expect(page.getByText('night').first()).toBeVisible();
  });

  test('should show booking form labels', async ({ page }) => {
    await expect(page.getByText('Check-in')).toBeVisible();
    await expect(page.getByText('Check-out')).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/auth/register', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.email === 'existing@example.com') {
        await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ success: false, error: 'Email already registered' }) });
      } else {
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: { user: { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'tourist' }, accessToken: 'tok', refreshToken: 'rtok' } }) });
      }
    });
    await page.route('**/api/v1/auth/login', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.email === 'john@example.com' && body.password === 'Password123') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { user: { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'tourist' }, accessToken: 'tok', refreshToken: 'rtok' } }) });
      } else {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false, error: 'Invalid credentials' }) });
      }
    });
  });

  test('Login page should display form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Login should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('Login page should link to register', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Sign up').click();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('Register page should display form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Create your account')).toBeVisible();
  });

  test('Register page should show role selection', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Book Stays')).toBeVisible();
    await expect(page.getByText('List Properties')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have accommodations link in nav', async ({ page }) => {
    await expect(page.locator('nav a:has-text("Accommodations")')).toBeVisible();
  });

  test('should have Sign In and Get Started links when logged out', async ({ page }) => {
    await expect(page.getByText('Sign In')).toBeVisible();
    await expect(page.getByText('Get Started')).toBeVisible();
  });
});
