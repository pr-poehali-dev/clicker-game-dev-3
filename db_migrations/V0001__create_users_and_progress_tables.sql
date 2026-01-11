CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    points BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    points_per_click BIGINT DEFAULT 1,
    points_per_second INTEGER DEFAULT 0,
    upgrades JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    selected_skin VARCHAR(100) DEFAULT 'Sparkles',
    owned_skins JSONB DEFAULT '["Sparkles"]'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_game_progress_user_id ON game_progress(user_id);