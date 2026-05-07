// Public read-model column allowlists for getPartyBySlug.
//
// Anything selected here is serialized into the public RSC payload via
// Server Components and is therefore visible to any unauthenticated visitor.
// Never add adminToken, accessCode, organizerEmail, or participant
// editToken/email/phone here. Sensitive admin reads must go through
// getPartyForAdmin instead.

export const publicPartyColumns = {
  id: true,
  slug: true,
  name: true,
  placeType: true,
  address: true,
  latitude: true,
  longitude: true,
  dateStart: true,
  dateEnd: true,
  description: true,
  coverImageUrl: true,
  isPrivate: true,
  organizerName: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const publicParticipantColumns = {
  id: true,
  partyId: true,
  name: true,
  guestCount: true,
  bringing: true,
  isOrganizer: true,
  createdAt: true,
} as const;
