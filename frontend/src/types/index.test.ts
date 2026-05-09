import { UserRole, BookingStatus, Province, AccommodationType } from './index';

describe('Types enums', () => {
  it('should have correct UserRole values', () => {
    expect(UserRole.TOURIST).toBe('tourist');
    expect(UserRole.HOST).toBe('host');
    expect(UserRole.ADMIN).toBe('admin');
  });

  it('should have correct BookingStatus values', () => {
    expect(BookingStatus.PENDING).toBe('pending');
    expect(BookingStatus.CONFIRMED).toBe('confirmed');
    expect(BookingStatus.CANCELLED).toBe('cancelled');
    expect(BookingStatus.COMPLETED).toBe('completed');
    expect(BookingStatus.REFUNDED).toBe('refunded');
  });

  it('should have correct Province values', () => {
    expect(Province.WESTERN_CAPE).toBe('Western Cape');
    expect(Province.GAUTENG).toBe('Gauteng');
    expect(Province.KWAZULU_NATAL).toBe('KwaZulu-Natal');
    expect(Province.EASTERN_CAPE).toBe('Eastern Cape');
  });

  it('should have correct AccommodationType values', () => {
    expect(AccommodationType.HOTEL).toBe('hotel');
    expect(AccommodationType.LODGE).toBe('lodge');
    expect(AccommodationType.VILLA).toBe('villa');
    expect(AccommodationType.GAME_LODGE).toBe('game_lodge');
  });
});
