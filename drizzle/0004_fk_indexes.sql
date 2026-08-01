CREATE INDEX "admin_checklists_party_id_idx" ON "admin_checklists" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "contributions_need_id_idx" ON "contributions" USING btree ("need_id");--> statement-breakpoint
CREATE INDEX "contributions_participant_id_idx" ON "contributions" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "discussion_channels_party_id_idx" ON "discussion_channels" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "needs_party_id_idx" ON "needs" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "participants_party_id_idx" ON "participants" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "parties_date_start_idx" ON "parties" USING btree ("date_start");--> statement-breakpoint
CREATE INDEX "party_updates_party_id_idx" ON "party_updates" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "party_updates_party_id_created_at_idx" ON "party_updates" USING btree ("party_id","created_at");