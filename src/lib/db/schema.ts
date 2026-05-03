import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const placeTypeEnum = pgEnum("place_type", [
  "rue",
  "impasse",
  "residence",
  "parc",
  "place",
  "autre",
]);

export const needCategoryEnum = pgEnum("need_category", [
  "nourriture_sale",
  "nourriture_sucre",
  "boissons_alcool",
  "boissons_sans_alcool",
  "mobilier",
  "materiel",
  "animations",
  "nettoyage",
  "autre",
]);

export const channelTypeEnum = pgEnum("channel_type", [
  "whatsapp",
  "signal",
  "telegram",
  "discord",
  "email",
  "autre",
]);

// Tables
export const parties = pgTable("parties", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  placeType: placeTypeEnum("place_type").notNull().default("autre"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  dateStart: timestamp("date_start", { withTimezone: true }).notNull(),
  dateEnd: timestamp("date_end", { withTimezone: true }),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  isPrivate: boolean("is_private").notNull().default(false),
  accessCode: varchar("access_code", { length: 50 }),
  organizerName: varchar("organizer_name", { length: 255 }).notNull(),
  organizerEmail: varchar("organizer_email", { length: 255 }).notNull(),
  notifyOnNewParticipant: boolean("notify_on_new_participant")
    .notNull()
    .default(false),
  adminToken: varchar("admin_token", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  partyId: uuid("party_id")
    .notNull()
    .references(() => parties.id, { onDelete: "cascade" }),
  editToken: varchar("edit_token", { length: 64 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  guestCount: integer("guest_count").notNull().default(1),
  bringing: text("bringing"),
  isOrganizer: boolean("is_organizer").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const needs = pgTable("needs", {
  id: uuid("id").defaultRandom().primaryKey(),
  partyId: uuid("party_id")
    .notNull()
    .references(() => parties.id, { onDelete: "cascade" }),
  category: needCategoryEnum("category").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  quantityNeeded: integer("quantity_needed").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contributions = pgTable("contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  needId: uuid("need_id")
    .notNull()
    .references(() => needs.id, { onDelete: "cascade" }),
  participantId: uuid("participant_id")
    .notNull()
    .references(() => participants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const discussionChannels = pgTable("discussion_channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  partyId: uuid("party_id")
    .notNull()
    .references(() => parties.id, { onDelete: "cascade" }),
  type: channelTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const adminChecklists = pgTable("admin_checklists", {
  id: uuid("id").defaultRandom().primaryKey(),
  partyId: uuid("party_id")
    .notNull()
    .references(() => parties.id, { onDelete: "cascade" }),
  itemKey: varchar("item_key", { length: 100 }).notNull(),
  isChecked: boolean("is_checked").notNull().default(false),
  checkedAt: timestamp("checked_at", { withTimezone: true }),
});

export const mairies = pgTable(
  "mairies",
  {
    codeInsee: varchar("code_insee", { length: 5 }).primaryKey(),
    nom: varchar("nom", { length: 255 }).notNull(),
    nomNormalise: varchar("nom_normalise", { length: 255 }).notNull(),
    codePostal: varchar("code_postal", { length: 5 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    telephone: varchar("telephone", { length: 50 }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("mairies_nom_normalise_idx").on(table.nomNormalise),
    // A GIN index with gin_trgm_ops also exists for ILIKE %q% queries; it is
    // declared manually in drizzle/0001_mairies.sql because drizzle-kit cannot
    // emit pg_trgm operator classes. Keep the two in sync.
  ]
);

export const partyUpdates = pgTable("party_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  partyId: uuid("party_id")
    .notNull()
    .references(() => parties.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relations
export const partiesRelations = relations(parties, ({ many }) => ({
  participants: many(participants),
  needs: many(needs),
  discussionChannels: many(discussionChannels),
  adminChecklists: many(adminChecklists),
  updates: many(partyUpdates),
}));

export const participantsRelations = relations(participants, ({ one, many }) => ({
  party: one(parties, {
    fields: [participants.partyId],
    references: [parties.id],
  }),
  contributions: many(contributions),
}));

export const needsRelations = relations(needs, ({ one, many }) => ({
  party: one(parties, {
    fields: [needs.partyId],
    references: [parties.id],
  }),
  contributions: many(contributions),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  need: one(needs, {
    fields: [contributions.needId],
    references: [needs.id],
  }),
  participant: one(participants, {
    fields: [contributions.participantId],
    references: [participants.id],
  }),
}));

export const discussionChannelsRelations = relations(
  discussionChannels,
  ({ one }) => ({
    party: one(parties, {
      fields: [discussionChannels.partyId],
      references: [parties.id],
    }),
  })
);

export const adminChecklistsRelations = relations(adminChecklists, ({ one }) => ({
  party: one(parties, {
    fields: [adminChecklists.partyId],
    references: [parties.id],
  }),
}));

export const partyUpdatesRelations = relations(partyUpdates, ({ one }) => ({
  party: one(parties, {
    fields: [partyUpdates.partyId],
    references: [parties.id],
  }),
}));

// Types
export type Party = typeof parties.$inferSelect;
export type NewParty = typeof parties.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type Need = typeof needs.$inferSelect;
export type NewNeed = typeof needs.$inferInsert;
export type Contribution = typeof contributions.$inferSelect;
export type NewContribution = typeof contributions.$inferInsert;
export type DiscussionChannel = typeof discussionChannels.$inferSelect;
export type NewDiscussionChannel = typeof discussionChannels.$inferInsert;
export type AdminChecklist = typeof adminChecklists.$inferSelect;
export type NewAdminChecklist = typeof adminChecklists.$inferInsert;
export type PartyUpdate = typeof partyUpdates.$inferSelect;
export type NewPartyUpdate = typeof partyUpdates.$inferInsert;
export type Mairie = typeof mairies.$inferSelect;
export type NewMairie = typeof mairies.$inferInsert;
