# Backend TODO List

## Project Setup
- [x] Integrate `pptxgenjs` for presentation generation.
- [x] Set up MongoDB for data storage.

## Authentication
- [x] Implement user registration and login using JWT.
- [x] Create middleware for protected routes.

## AI Integration
- [x] Integrate `deepseek` cloud API for content generation.
- [x] Develop a separate service/server for fetching images from the web.
- [x] Implement a mechanism to search the web and feed information to `deepseek`.

## PPTX and Resume Generation Logic
- [ ] Create an endpoint to generate PPTX files based on user input and AI-generated content.
- [ ] Maintain and adapt existing resume builder functionality.

## History and Data Storage
- [ ] Create database schemas for users, presentations (history), and prompt feedback.
- [ ] Implement endpoints to save and retrieve user's presentation and resume history.

## Review and Refinement
- [ ] Create an endpoint to handle user reviews for generated content.
- [ ] Implement logic to process reviews, recall the AI with refined prompts, and update the content.
- [ ] Store a summary of the review/refinement process in MongoDB to improve future prompts.