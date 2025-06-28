-- Food Items
INSERT INTO food (id, name, price) VALUES (1, 'Dosa', 60.0);
INSERT INTO food (id, name, price) VALUES (2, 'Paneer Butter Masala', 160.0);

-- Users (id, username, password, role)
-- Passwords are bcrypt-hashed (Spring Security-ready)

INSERT INTO user (id, username, password, role) VALUES
(10, 'manager', '$2a$10$2g9bpfKYexJNc9vj4MnUguztedVVk8ZSahOJfAXTn4iddSiY6uzJW', 'MANAGER'),
(11, 'admin', '$2a$10$6oyzOMr9S7KKwQ7UMxOFGODDDzlDLrZRFzg5LfMOShnQZ6a3K0JbC', 'ADMIN'),
(13, 'waiter', '$2a$10$rPrCSE6OpB9pEdie3gGo6.4CS12TsGo4rrjPZeeOoE4Bb17gsUwpO', 'WAITER');
