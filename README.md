PromptForge is a full-stack AI prompt engineering platform that helps users create, refine, and manage prompts for large language models.

Frontend: Built with React and Vite for fast development, styled with Tailwind CSS for a responsive, modern UI.
Backend: Node.js and Express power the REST API, handling authentication, prompt storage, and AI integration logic.
AI Integration: Uses Groq's Llama 3.3 70B model to generate and improve prompts in real time, leveraging Groq's low-latency inference.
Database: MongoDB Atlas for scalable, cloud-hosted data storage of user prompts and history.
Authentication: Secure login via Passport.js with Google OAuth, allowing users to sign in with their Google accounts.

The project involved solving real-world deployment and environment challenges, including PowerShell execution policy issues, dependency version conflicts (connect-mongo), and MongoDB Atlas SRV DNS resolution failures.
