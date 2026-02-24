CREATE INDEX "commentary_match_id_idx" ON "commentary" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "commentary_created_at_idx" ON "commentary" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "matches_created_at_idx" ON "matches" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "matches_status_idx" ON "matches" USING btree ("status");