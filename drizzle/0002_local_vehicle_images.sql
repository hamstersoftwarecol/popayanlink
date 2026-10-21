-- Self-host the existing illustration photos without changing vehicle ownership or availability.
UPDATE vehicles SET image='/images/toyota-fortuner.webp' WHERE image='https://images.unsplash.com/photo-1519641471654-76ce0107ad1b' OR substr(image,1,61)='https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?';
UPDATE vehicles SET image='/images/mercedes-c200.webp' WHERE image='https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8' OR substr(image,1,61)='https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?';
UPDATE vehicles SET image='/images/porsche-911.webp' WHERE image='https://images.unsplash.com/photo-1503376780353-7e6692767b70' OR substr(image,1,61)='https://images.unsplash.com/photo-1503376780353-7e6692767b70?';
UPDATE vehicles SET image='/images/bmw-x5.webp' WHERE image='https://images.unsplash.com/photo-1555215695-3004980ad54e' OR substr(image,1,58)='https://images.unsplash.com/photo-1555215695-3004980ad54e?';
UPDATE vehicles SET image='/images/audi-a5.webp' WHERE image='https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6' OR substr(image,1,61)='https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?';
UPDATE vehicles SET image='/images/jeep-wrangler.webp' WHERE image='https://images.unsplash.com/photo-1516939884455-1445c8652f83' OR substr(image,1,61)='https://images.unsplash.com/photo-1516939884455-1445c8652f83?';
