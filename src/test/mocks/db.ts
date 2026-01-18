import { vi } from "vitest";

// Mock database responses
export const mockParty = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  slug: "rue-jaboulay-lyon",
  name: "Fête de la rue Jaboulay",
  placeType: "rue",
  address: "15 rue Jaboulay, 69007 Lyon",
  latitude: "45.7578",
  longitude: "4.8320",
  dateStart: new Date("2026-05-29T14:00:00Z"),
  dateEnd: new Date("2026-05-29T21:00:00Z"),
  description: "Une super fête",
  coverImageUrl: null,
  isPrivate: false,
  accessCode: null,
  organizerName: "Jean Dupont",
  organizerEmail: "jean@example.com",
  adminToken: "abc123def456",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockParticipant = {
  id: "660e8400-e29b-41d4-a716-446655440001",
  partyId: mockParty.id,
  editToken: "edittoken1234567890",
  name: "Marie Martin",
  email: "marie@example.com",
  phone: "0612345678",
  guestCount: 2,
  bringing: "Une salade",
  isOrganizer: false,
  createdAt: new Date(),
};

// Create mock database object
export const createMockDb = () => {
  const mockTransaction = vi.fn().mockImplementation(async (callback) => {
    const tx = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockParty]),
        }),
      }),
    };
    return callback(tx);
  });

  return {
    query: {
      parties: {
        findFirst: vi.fn(),
      },
      participants: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockParticipant]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: mockParticipant.id }]),
        }),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockParticipant]),
        }),
      }),
    }),
    transaction: mockTransaction,
  };
};
