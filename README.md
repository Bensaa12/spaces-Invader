# Space Shooter Game

A fun space shooter game with power-ups, different enemy types, and a global leaderboard powered by Supabase.

🎮 [Play the game online](https://bensaa12.github.io/Space-Invader/) 🎮

## Features

- Multiple enemy types with different behaviors
- Power-up system (Rapid Fire, Multi Shot, Shield)
- Level progression with increasing difficulty
- Global leaderboard to compete with other players
- Visual effects and animations

## How to Play

- Use arrow keys to move your spaceship
- Press space to shoot
- Collect power-ups to gain special abilities:
  - Purple: Rapid Fire
  - Cyan: Multi Shot
  - Green: Shield
- Defeat enemies to increase your score
- Submit your score to the leaderboard when the game ends

## Development

This game is built using:
- p5.js for game graphics and interaction
- Supabase for the online leaderboard

## Local Development

To run the game locally:

1. Clone the repository
   ```
   git clone https://github.com/Bensaa12/Space-Invader.git
   cd Space-Invader
   ```

2. Start a local server
   - You can use Python's built-in HTTP server:
     ```
     python -m http.server
     ```
   - Or use any other local server of your choice

3. Open your browser and navigate to `http://localhost:8000`

## Contributing

Feel free to contribute to this project by:
1. Forking the repository
2. Creating your feature branch (`git checkout -b feature/AmazingFeature`)
3. Committing your changes (`git commit -m 'Add some AmazingFeature'`)
4. Pushing to the branch (`git push origin feature/AmazingFeature`)
5. Opening a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [p5.js](https://p5js.org/)
- Backend powered by [Supabase](https://supabase.com/)
- Deployed with [GitHub Pages](https://pages.github.com/)

## Game URL

The game is hosted at: https://bensaa12.github.io/Space-Invader/

## GitHub Repository

Source code available at: https://github.com/Bensaa12/Space-Invader

## Deploying to GitHub Pages

This repository is set up to automatically deploy to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment Steps

If you want to deploy this game to your own GitHub Pages:

1. **Fork this repository**
   - Click the "Fork" button at the top right of this repository

2. **Enable GitHub Pages**
   - Go to your forked repository's Settings
   - Scroll down to the "GitHub Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Your game will be available at `https://yourusername.github.io/repository-name/`

3. **Update Supabase Configuration (Optional)**
   - If you want to use your own Supabase instance, update the configuration in `sketch.js`
   - Replace the Supabase URL and key with your own

### Using GitHub Actions for Deployment

This repository includes a GitHub Actions workflow that automatically deploys the game to GitHub Pages when changes are pushed to the main branch.

To use this workflow:

1. Make sure your repository has GitHub Pages enabled in the Settings
2. The workflow file is located at `.github/workflows/deploy.yml`
3. Any push to the main branch will trigger a deployment
4. You can also manually trigger a deployment from the Actions tab

## Supabase Setup

### 1. Set up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Once your project is created, go to the SQL Editor
4. Run the following SQL to create the leaderboard table:

```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX leaderboard_score_idx ON leaderboard (score DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert
CREATE POLICY "Allow anonymous inserts" ON leaderboard
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows anyone to select
CREATE POLICY "Allow anonymous reads" ON leaderboard
  FOR SELECT USING (true);
```

5. Go to the "Settings" > "API" section in your Supabase dashboard
6. Copy your "Project URL" and "anon public" key

### 2. Configure the Game

1. Open the `sketch.js` file
2. Replace the placeholder values with your actual Supabase credentials:

```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_KEY = 'your-anon-key';
```

## Privacy Note

The leaderboard stores email addresses to identify players. Email addresses are partially masked when displayed on the leaderboard to protect privacy.
