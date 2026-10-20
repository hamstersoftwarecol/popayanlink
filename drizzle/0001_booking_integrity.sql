CREATE TRIGGER booking_conflict_insert BEFORE INSERT ON bookings WHEN NEW.status IN ('pending','confirmed','in_progress') AND EXISTS (
 SELECT 1 FROM bookings b WHERE b.id != NEW.id AND b.status IN ('pending','confirmed','in_progress') AND (
 (NEW.vehicle_id IS NOT NULL AND b.vehicle_id=NEW.vehicle_id AND (NEW.kind='sale' OR b.kind='sale' OR (b.start_at<NEW.end_at AND b.end_at>NEW.start_at)))
 OR (NEW.kind='repair' AND b.kind='repair' AND b.start_at<NEW.end_at AND b.end_at>NEW.start_at)
 )) BEGIN SELECT RAISE(ABORT, 'BOOKING_CONFLICT'); END;
--> statement-breakpoint
CREATE TRIGGER booking_conflict_update BEFORE UPDATE OF status, start_at, end_at, vehicle_id ON bookings WHEN NEW.status IN ('pending','confirmed','in_progress') AND EXISTS (
 SELECT 1 FROM bookings b WHERE b.id != NEW.id AND b.status IN ('pending','confirmed','in_progress') AND (
 (NEW.vehicle_id IS NOT NULL AND b.vehicle_id=NEW.vehicle_id AND (NEW.kind='sale' OR b.kind='sale' OR (b.start_at<NEW.end_at AND b.end_at>NEW.start_at)))
 OR (NEW.kind='repair' AND b.kind='repair' AND b.start_at<NEW.end_at AND b.end_at>NEW.start_at)
 )) BEGIN SELECT RAISE(ABORT, 'BOOKING_CONFLICT'); END;
