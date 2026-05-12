# Nova AI Teacher 🎓

Personal AI tutor for UAE students — Arabic & English, Grade 4–9.

## How It Works (Secure Architecture)
```
Student Browser  →  /api/chat (Vercel Serverless)  →  Anthropic API
                         ↑
               API key lives HERE only
               Never sent to browser
```

## Deploy to Vercel (5 minutes)

### Step 1 — Push to GitHub
1. Create a free account at github.com
2. Create a new repository called `nova-ai-teacher`
3. Upload all these files to it

### Step 2 — Connect to Vercel
1. Go to vercel.com → Sign in with GitHub
2. Click "Add New Project"
3. Select your `nova-ai-teacher` repository
4. Click "Deploy" (don't change any settings)

### Step 3 — Add Your API Key
1. In Vercel dashboard → Your project → Settings → Environment Variables
2. Add:
   - NAME:  ANTHROPIC_API_KEY
   - VALUE: sk-ant-xxxxxxxxxx  (your key from console.anthropic.com)
3. Click Save
4. Go to Deployments → click "Redeploy"

### Step 4 — You're Live! 🎉
Your URL will be: https://nova-ai-teacher.vercel.app

## Get Anthropic API Key
1. Go to console.anthropic.com
2. Sign up (free $5 credit included)
3. Click API Keys → Create Key
4. Copy it (starts with sk-ant-)

## Subjects
- Mathematics 📐
- Science 🔬
- English 📖
- Arabic ✍️ عربي

## Grades
Grade 4 through Grade 9 — aligned with UAE MOE curriculum
