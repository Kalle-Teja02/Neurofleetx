UPDATE vehicle 
SET 
    latitude = 17.385044 + (RAND() * 0.1 - 0.05),
    longitude = 78.486671 + (RAND() * 0.1 - 0.05),
    battery_percentage = 60 + FLOOR(RAND() * 40),
    fuel_percentage = 40 + FLOOR(RAND() * 60)
WHERE latitude IS NULL OR battery_percentage IS NULL;
