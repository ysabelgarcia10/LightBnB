
SELECT properties.title, properties.cost_per_night, reservations.start_date, AVG(property_reviews.rating) as average_ratings
FROM properties 
JOIN reservations ON reservations.property_id = properties.id
JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE reservations.guest_id = 1 AND end_date < now()::date
GROUP BY properties.title, properties.cost_per_night, reservations.start_date
ORDER BY start_date
LIMIT 10;
