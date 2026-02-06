CREATE TABLE users (
  user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  email TEXT NOT NULL UNIQUE 
    CHECK (email != '' AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    
  first_name TEXT NOT NULL 
    CHECK (first_name != '' AND char_length(first_name) <= 50),

  last_name TEXT NOT NULL 
    CHECK (last_name != '' AND char_length(last_name) <= 50),
  
  position TEXT NOT NULL 
    CHECK (position != '' AND char_length(position) <= 100),

  password TEXT NOT NULL CHECK (password != ''),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE email_verification_tokens (
  verification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE
);

drop table users
drop table email_verification_tokens

SELECT * FROM users;

SELECT * FROM email_verification_tokens;

SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'users';